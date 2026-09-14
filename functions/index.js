const functions = require('firebase-functions');
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * 1. Automatic Custom Claim Sync on User Creation
 * Triggered whenever a new user profile document is created in `users/{uid}`.
 * Sets the Firebase Auth custom claim { role: doc.role } so that ID tokens
 * can be verified cryptographically by API endpoints and client guards.
 */
exports.onUserCreated = functions.firestore
  .document('users/{uid}')
  .onCreate(async (snap, context) => {
    const { uid } = context.params;
    const userData = snap.data();
    const role = userData.role || 'candidate';

    console.log(`[CloudFunction: onUserCreated] Setting role "${role}" for UID: ${uid}`);

    try {
      // Set Firebase Auth custom user claims
      await admin.auth().setCustomUserClaims(uid, {
        role: role,
        accountStatus: userData.accountStatus || 'active',
      });

      // Record audit entry
      await db.collection('auditLogs').add({
        action: 'CUSTOM_CLAIMS_SET',
        actorId: 'system',
        targetUid: uid,
        role: role,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`[CloudFunction: onUserCreated] Custom claims successfully synced for UID: ${uid}`);
    } catch (err) {
      console.error(`[CloudFunction: onUserCreated] Error setting claims for ${uid}:`, err);
    }
  });

/**
 * 2. Submit Role Change Request (Callable HTTPS Function)
 * Allows an authenticated user to request an upgrade or role change.
 * Saves the request into the `roleRequests` collection for administrator triage.
 */
exports.submitRoleRequest = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be signed in to submit a role change request.'
    );
  }

  const { requestedRole, reason } = data;
  const validRoles = ['candidate', 'recruiter', 'organizer'];

  if (!requestedRole || !validRoles.includes(requestedRole)) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      `Requested role must be one of: ${validRoles.join(', ')}`
    );
  }

  if (!reason || reason.trim().length < 10) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Please provide a meaningful justification (at least 10 characters).'
    );
  }

  const uid = context.auth.uid;
  const email = context.auth.token.email || 'unknown';
  const currentRole = context.auth.token.role || 'candidate';

  if (currentRole === requestedRole) {
    throw new functions.https.HttpsError(
      'already-exists',
      `You are already verified as a ${currentRole}.`
    );
  }

  // Create request document
  const requestRef = await db.collection('roleRequests').add({
    userId: uid,
    email: email,
    currentRole: currentRole,
    requestedRole: requestedRole,
    reason: reason.trim(),
    status: 'pending',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    reviewedBy: null,
    reviewedAt: null,
  });

  return {
    success: true,
    requestId: requestRef.id,
    message: 'Role change request submitted for administrator review.',
  };
});

/**
 * 3. Admin Review of Role Request (Callable HTTPS Function)
 * Restricted strictly to users with { role: 'admin' } in their custom claims.
 * Approves or rejects the request, updates Firestore, and updates Auth custom claims.
 */
exports.adminReviewRoleRequest = functions.https.onCall(async (data, context) => {
  // Enforce server-side role check
  if (!context.auth || (context.auth.token.role !== 'admin' && context.auth.token.role !== 'super_admin')) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Access restricted to authorized platform administrators.'
    );
  }

  const { requestId, decision, notes } = data;
  if (!requestId || !['approved', 'rejected'].includes(decision)) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Valid requestId and decision ("approved" | "rejected") required.'
    );
  }

  const requestRef = db.collection('roleRequests').doc(requestId);
  const requestSnap = await requestRef.get();

  if (!requestSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Role request not found.');
  }

  const reqData = requestSnap.data();
  if (reqData.status !== 'pending') {
    throw new functions.https.HttpsError(
      'failed-precondition',
      `This request has already been ${reqData.status}.`
    );
  }

  const targetUid = reqData.userId;
  const targetRole = reqData.requestedRole;

  if (decision === 'approved') {
    // 1. Update Firestore user document
    await db.collection('users').doc(targetUid).update({
      role: targetRole,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // 2. Set Firebase Auth custom claims
    await admin.auth().setCustomUserClaims(targetUid, {
      role: targetRole,
    });

    // 3. Mark request as approved
    await requestRef.update({
      status: 'approved',
      notes: notes || 'Approved by admin',
      reviewedBy: context.auth.uid,
      reviewedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // 4. Audit log
    await db.collection('auditLogs').add({
      action: 'USER_ROLE_APPROVED',
      actorId: context.auth.uid,
      targetUid: targetUid,
      previousRole: reqData.currentRole,
      newRole: targetRole,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true, message: `User role updated to ${targetRole}.` };
  } else {
    // Rejected
    await requestRef.update({
      status: 'rejected',
      notes: notes || 'Rejected by admin',
      reviewedBy: context.auth.uid,
      reviewedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true, message: 'Role request rejected.' };
  }
});

/**
 * 4. Admin Direct Set User Role (Callable HTTPS Function)
 * Allows an administrator to explicitly elevate or change a user's role.
 */
exports.adminSetUserRole = functions.https.onCall(async (data, context) => {
  if (!context.auth || (context.auth.token.role !== 'admin' && context.auth.token.role !== 'super_admin')) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Access restricted to platform administrators.'
    );
  }

  const { targetUid, newRole } = data;
  const validRoles = ['candidate', 'recruiter', 'organizer', 'admin'];

  if (!targetUid || !validRoles.includes(newRole)) {
    throw new functions.https.HttpsError('invalid-argument', 'Valid targetUid and role required.');
  }

  // Update in Firestore
  await db.collection('users').doc(targetUid).set(
    {
      role: newRole,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  // Update custom claims in Auth
  await admin.auth().setCustomUserClaims(targetUid, { role: newRole });

  return { success: true, message: `Successfully updated user role to ${newRole}.` };
});

/**
 * 5. Example Server-Verified Role Endpoint (Callable)
 * Demonstrates server-side role re-verification before executing recruiter-only logic.
 */
exports.recruiterOnlyAction = functions.https.onCall(async (data, context) => {
  if (!context.auth || (context.auth.token.role !== 'recruiter' && context.auth.token.role !== 'admin')) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Not authorized: Only verified recruiters can perform candidate queries.'
    );
  }

  return {
    authorized: true,
    message: 'Authorized recruiter action executed successfully.',
    recruiterId: context.auth.uid,
  };
});
