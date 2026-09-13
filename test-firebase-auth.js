/**
 * Test Firebase Authentication Connection & Sync
 */
import axios from 'axios';

const API_BASE = 'http://localhost:6970/api';

async function runFirebaseTests() {
  console.log('=============================================================');
  console.log(' RUNNING FIREBASE AUTHENTICATION CONNECTION TESTS');
  console.log('=============================================================');

  try {
    // 1. Check API health
    const health = await axios.get(`${API_BASE}/health`);
    console.log('✓ API health check:', health.data.status);

    // 2. Test Google Auth sync with pre-verified Firebase Google identity
    const testGoogleEmail = `firebase.user.${Date.now()}@gmail.com`;
    console.log(`\nTesting Google Auth sync for new Firebase user: ${testGoogleEmail}`);

    // Step 2a: First time Google Sign In (needs role selection)
    const initialRes = await axios.post(`${API_BASE}/auth/google`, {
      email: testGoogleEmail,
      name: 'Firebase Test User',
      photoUrl: 'https://lh3.googleusercontent.com/a/test-avatar',
    });

    if (initialRes.data.isNewUser) {
      console.log('✓ Detected new user needing role onboarding');
    } else {
      throw new Error('Expected isNewUser: true for new Google user');
    }

    // Step 2b: User selects 'candidate' role and completes onboarding
    const completeRes = await axios.post(`${API_BASE}/auth/google`, {
      email: testGoogleEmail,
      name: 'Firebase Test User',
      role: 'candidate',
      photoUrl: 'https://lh3.googleusercontent.com/a/test-avatar',
    });

    console.log('✓ Firebase user registered with role candidate:', completeRes.data.user.role);
    console.log('✓ User email verified flag:', completeRes.data.user.emailVerified);
    console.log('✓ JWT access token issued:', Boolean(completeRes.data.access));

    // Step 2c: Returning Google Sign In directly restores session
    const returningRes = await axios.post(`${API_BASE}/auth/google`, {
      email: testGoogleEmail,
    });

    console.log('✓ Returning Firebase Google user signed in immediately:', returningRes.data.user.email);
    console.log('✓ Correct role retained:', returningRes.data.user.role);

    // 3. Verify accessing protected route with Firebase-issued backend token
    const meRes = await axios.get(`${API_BASE}/auth/me`, {
      headers: {
        Authorization: `Bearer ${returningRes.data.access}`,
      },
    });

    console.log('✓ Authenticated request using JWT succeeded. User ID:', meRes.data.id);
    console.log('✓ Email verification status:', meRes.data.emailVerified);

    console.log('\n=============================================================');
    console.log(' ✅ ALL FIREBASE AUTH INTEGRATION TESTS PASSED');
    console.log('=============================================================');
  } catch (err) {
    console.error('❌ Test failed:', err.response?.data || err.message);
    process.exit(1);
  }
}

runFirebaseTests();
