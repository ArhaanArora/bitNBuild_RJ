/**
 * SkillVerify — Centralized Authentication & RBAC Integration Test Suite
 * Validates:
 * 1. Centralized Login (Candidate, Recruiter, Organizer)
 * 2. Role Conflict Detection on Duplicate Registration (§3.1, §9)
 * 3. Server-Side Authorization Boundary Checks (§0, §4, §12)
 * 4. Password Recovery & Single-Use Token Flow (§6)
 * 5. Email Verification State Management (§6, §9)
 * 6. Isolated Admin Security Console Authentication (§1, §8)
 * 7. User Suspension Enforcement (§7, §9)
 * 8. Immutable Audit Log Verification for State Changes (§8)
 */

const http = require('http');

const API_BASE = 'http://localhost:6970';

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE + path);
    const data = body ? JSON.stringify(body) : null;

    const headers = {
      'Content-Type': 'application/json',
    };
    if (data) headers['Content-Length'] = Buffer.byteLength(data);
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(
      {
        method,
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + (url.search || ''),
        headers,
      },
      (res) => {
        let resData = '';
        res.on('data', (chunk) => (resData += chunk));
        res.on('end', () => {
          try {
            const parsed = resData ? JSON.parse(resData) : {};
            resolve({ status: res.statusCode, body: parsed });
          } catch {
            resolve({ status: res.statusCode, raw: resData });
          }
        });
      }
    );

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✓ ${message}`);
}

async function runTests() {
  console.log('\n=============================================================');
  console.log(' RUNNING CENTRALIZED AUTH & RBAC VERIFICATION TEST SUITE');
  console.log('=============================================================\n');

  // Test 1: API Health
  const health = await request('GET', '/api/health');
  assert(health.status === 200 && health.body.status === 'ok', 'API health check passed');

  // Test 2: Centralized Login as Candidate
  const candLogin = await request('POST', '/api/auth/login', {
    email: 'alex@demo.local',
    password: 'Demo1234!',
  });
  assert(candLogin.status === 200, 'Candidate login succeeded (200 OK)');
  assert(candLogin.body.user?.role === 'candidate', 'Candidate role verified');
  assert(Boolean(candLogin.body.access), 'Access JWT minted for candidate');
  const candidateToken = candLogin.body.access;

  // Test 3: Centralized Login as Recruiter
  const recLogin = await request('POST', '/api/auth/login', {
    email: 'recruiter@demo.local',
    password: 'Demo1234!',
  });
  assert(recLogin.status === 200, 'Recruiter login succeeded (200 OK)');
  assert(recLogin.body.user?.role === 'recruiter', 'Recruiter role verified');

  // Test 4: Centralized Login as Organizer
  const orgLogin = await request('POST', '/api/auth/login', {
    email: 'organizer@demo.local',
    password: 'Demo1234!',
  });
  assert(orgLogin.status === 200, 'Organizer login succeeded (200 OK)');
  assert(orgLogin.body.user?.role === 'organizer', 'Organizer role verified');

  // Test 5: Role Conflict on Duplicate Registration (§3.1, §9)
  const conflictReg = await request('POST', '/api/auth/register', {
    email: 'recruiter@demo.local',
    password: 'NewPassword123!',
    firstName: 'Tamper',
    lastName: 'Attempt',
    role: 'candidate',
  });
  assert(conflictReg.status === 409, 'Duplicate email registration rejected with 409 Conflict');
  assert(
    conflictReg.body.error === 'This account already has a Recruiter profile. Please continue with your existing role.',
    `Role conflict exact copy verified: "${conflictReg.body.error}"`
  );

  // Test 6: Server-Side Authorization Check (§0, §4, §12)
  // A candidate attempting to access an organizer-only endpoint (POST /api/assessments) must be rejected with 403 Forbidden
  const forbiddenAttempt = await request(
    'POST',
    '/api/assessments',
    {
      title: 'Malicious Assessment',
      description: 'Candidate attempting to create organizer assessment',
      durationMinutes: 10,
    },
    candidateToken
  );
  assert(
    forbiddenAttempt.status === 403,
    `Candidate blocked by server-side RoleGuard (403 Forbidden). Status: ${forbiddenAttempt.status}`
  );

  // Test 7: Password Recovery Flow (§6)
  const forgotReq = await request('POST', '/api/auth/forgot-password', {
    email: 'alex@demo.local',
  });
  assert(forgotReq.status === 200, 'Password recovery initiated (200 OK)');
  assert(Boolean(forgotReq.body.demoToken), 'Single-use cryptographic reset token generated');

  const resetReq = await request('POST', '/api/auth/reset-password', {
    token: forgotReq.body.demoToken,
    newPassword: 'Demo1234!Updated',
  });
  assert(resetReq.status === 200, 'Password successfully reset using single-use token');

  // Re-verify login with new password
  const newPassLogin = await request('POST', '/api/auth/login', {
    email: 'alex@demo.local',
    password: 'Demo1234!Updated',
  });
  assert(newPassLogin.status === 200, 'Login succeeded with newly updated password');

  // Restore original password for demo predictability
  const forgotRestore = await request('POST', '/api/auth/forgot-password', { email: 'alex@demo.local' });
  await request('POST', '/api/auth/reset-password', {
    token: forgotRestore.body.demoToken,
    newPassword: 'Demo1234!',
  });
  console.log('✓ Restored original demo credentials');

  // Test 8: Email Verification Resend (§6, §9)
  const verifyResend = await request('POST', '/api/auth/resend-verification', {}, candidateToken);
  assert(verifyResend.status === 200, 'Email verification resend dispatched');
  assert(
    verifyResend.body.message === "We've sent a verification email. Please verify your email before continuing.",
    `Email verification notification copy verified: "${verifyResend.body.message}"`
  );

  // Test 9: Isolated Admin Security Console Authentication (§1, §8)
  const adminLogin = await request('POST', '/api/admin/auth/login', {
    email: 'admin@skillverify.com',
    password: 'AdminSecret2025!',
  });
  assert(adminLogin.status === 200, 'Admin Security Console login succeeded (200 OK)');
  assert(adminLogin.body.admin?.adminRole === 'super_admin', 'Admin authenticated with super_admin tier');
  assert(Boolean(adminLogin.body.token), 'Isolated Admin JWT minted');
  const adminToken = adminLogin.body.token;

  // Candidate attempting to access admin security console must be rejected
  const candidateAdminAccess = await request('GET', '/api/admin/security/overview', null, candidateToken);
  assert(
    candidateAdminAccess.status === 403 || candidateAdminAccess.status === 401,
    `Candidate denied access to Admin Security Console (Status: ${candidateAdminAccess.status} Denied)`
  );

  // Admin access to security overview metrics
  const securityOverview = await request('GET', '/api/admin/security/overview', null, adminToken);
  assert(securityOverview.status === 200, 'Security Overview metrics fetched successfully');
  assert(securityOverview.body.metrics?.totalUsers > 0, `Total platform users: ${securityOverview.body.metrics?.totalUsers}`);

  // Test 10: User Suspension & Immutable Audit Trail (§7, §8, §9)
  // Let's create a temporary candidate user to test suspension safely
  const tempEmail = `test.audit.${Date.now()}@example.com`;
  const tempUserReg = await request('POST', '/api/auth/register', {
    email: tempEmail,
    password: 'TempPassword123!',
    firstName: 'Suspension',
    lastName: 'Subject',
    role: 'candidate',
  });
  assert(tempUserReg.status === 201, 'Temporary test user created for suspension testing');
  const tempUserId = tempUserReg.body.user.id;

  // Suspend the user as Admin
  const suspendReq = await request(
    'POST',
    `/api/admin/security/users/${tempUserId}/status`,
    {
      status: 'suspended',
      reason: 'Flagged for integrity review under security policy Section 8',
    },
    adminToken
  );
  assert(suspendReq.status === 200, 'User account suspended by Admin Security Operator');

  // Attempting to log in as suspended user must be blocked with exact copy (§9)
  const suspendedLoginAttempt = await request('POST', '/api/auth/login', {
    email: tempEmail,
    password: 'TempPassword123!',
  });
  assert(suspendedLoginAttempt.status === 403, 'Suspended account login blocked with 403 Forbidden');
  assert(
    suspendedLoginAttempt.body.error === 'Your account is currently under review. Contact support for details.',
    `Suspension copy verified: "${suspendedLoginAttempt.body.error}"`
  );

  // Verify that an immutable audit log entry was recorded for the suspension
  const auditLogs = await request('GET', '/api/admin/security/audit-logs', null, adminToken);
  assert(auditLogs.status === 200, 'Audit logs retrieved');
  const suspendLog = auditLogs.body.logs?.find(
    (l) => l.action === 'USER_ACCOUNT_SUSPENDED' && l.entityId === tempUserId
  );
  assert(Boolean(suspendLog), 'Verified that USER_ACCOUNT_SUSPENDED was written to immutable audit logs');
  assert(
    suspendLog.reason === 'Flagged for integrity review under security policy Section 8',
    `Audit log justification reason matched: "${suspendLog.reason}"`
  );
  assert(suspendLog.actorEmail === 'admin@skillverify.com', 'Audit log actor verified');

  // Reactivate test user
  const reactivateReq = await request(
    'POST',
    `/api/admin/security/users/${tempUserId}/status`,
    {
      status: 'active',
      reason: 'Security review cleared. Reactivated.',
    },
    adminToken
  );
  assert(reactivateReq.status === 200, 'User account reactivated');

  const reactivatedLogin = await request('POST', '/api/auth/login', {
    email: tempEmail,
    password: 'TempPassword123!',
  });
  assert(reactivatedLogin.status === 200, 'Reactivated user successfully logged in');

  console.log('\n=============================================================');
  console.log(' ✅ ALL CENTRALIZED AUTH & RBAC TESTS PASSED (100%)');
  console.log('=============================================================\n');
}

runTests().catch((err) => {
  console.error('❌ Test suite failed:', err);
  process.exit(1);
});
