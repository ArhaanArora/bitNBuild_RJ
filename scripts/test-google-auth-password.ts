import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../packages/api/.env') });

import app from '../packages/api/src/index';
import axios from 'axios';
import http from 'http';

const TEST_PORT = 6988;
const BASE_URL = `http://localhost:${TEST_PORT}/api`;

async function runTestSuite() {
  console.log('===============================================================');
  console.log('  TESTING GOOGLE AUTHENTICATION + CREATE PASSWORD FLOW');
  console.log('===============================================================\n');

  // Start temporary test server
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(TEST_PORT, () => resolve()));
  console.log(`✓ Test API server running on port ${TEST_PORT}\n`);

  try {
    // 1. Health check
    const health = await axios.get(`${BASE_URL}/health`);
    console.log('✓ API Health Check:', health.data.status);

    // 2. Test Google Auth with existing Demo ID & create password
    const demoGoogleEmail = 'alex.chen.dev@gmail.com';
    const demoPassword = 'DemoGooglePass123!';

    console.log(`\n[Test 1] Google Authentication with Demo ID: ${demoGoogleEmail}`);
    console.log(`Setting created password: "${demoPassword}"`);

    const googleAuthRes = await axios.post(`${BASE_URL}/auth/google`, {
      email: demoGoogleEmail,
      name: 'Alex Chen',
      role: 'candidate',
      password: demoPassword,
    });

    console.log('✓ Google Authentication Status:', googleAuthRes.status);
    console.log('✓ Response Message:', googleAuthRes.data.message);
    console.log('✓ User Role:', googleAuthRes.data.user.role);
    console.log('✓ Email Verified:', googleAuthRes.data.user.emailVerified);
    console.log('✓ Access Token Received:', Boolean(googleAuthRes.data.access));

    // 3. Test Email + Password Login using the newly created password!
    console.log(`\n[Test 2] Testing standard Email/Password Login with the created password:`);
    console.log(`POST /api/auth/login { email: "${demoGoogleEmail}", password: "${demoPassword}" }`);

    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: demoGoogleEmail,
      password: demoPassword,
    });

    console.log('✓ Login Success! Status:', loginRes.status);
    console.log('✓ Welcome Message:', loginRes.data.message);
    console.log('✓ User ID:', loginRes.data.user.id);
    console.log('✓ Logged in as Role:', loginRes.data.user.role);
    const accessToken = loginRes.data.access;

    // 4. Test accessing protected /api/auth/me with the login token
    console.log('\n[Test 3] Verifying authenticated session via /api/auth/me:');
    const meRes = await axios.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    console.log('✓ Session verified for User:', meRes.data.email, '| Name:', meRes.data.firstName, meRes.data.lastName);

    // 5. Test invalid password rejection
    console.log('\n[Test 4] Verifying incorrect password is properly rejected:');
    try {
      await axios.post(`${BASE_URL}/auth/login`, {
        email: demoGoogleEmail,
        password: 'WrongPassword999!',
      });
      throw new Error('Expected 401 error for wrong password but request succeeded');
    } catch (err: any) {
      if (err.response?.status === 401) {
        console.log('✓ Correctly rejected with 401 Unauthorized:', err.response.data.error);
      } else {
        throw err;
      }
    }

    // 6. Test fresh brand-new Google identity creation with password in 1 step
    const freshEmail = `demo.google.${Date.now()}@gmail.com`;
    const freshPassword = 'FreshDemoSecurePassword1!';

    console.log(`\n[Test 5] Registering brand new Google user with password: ${freshEmail}`);
    const newGoogleRes = await axios.post(`${BASE_URL}/auth/google`, {
      email: freshEmail,
      name: 'Google New Tester',
      role: 'candidate',
      password: freshPassword,
    });

    console.log('✓ New Google user created! ID:', newGoogleRes.data.user.id);
    console.log('✓ Pre-verified by Google:', newGoogleRes.data.user.emailVerified);

    console.log('\n[Test 6] Logging in with the new user using ONLY Email + Password:');
    const newLoginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: freshEmail,
      password: freshPassword,
    });

    console.log('✓ New user Email/Password login succeeded! Role:', newLoginRes.data.user.role);

    console.log('\n===============================================================');
    console.log('  🎉 ALL GOOGLE AUTH + CREATE PASSWORD TESTS PASSED (100%)');
    console.log('===============================================================\n');
  } catch (error: any) {
    console.error('❌ Test Suite Failed:', error.response?.data || error.message);
    process.exitCode = 1;
  } finally {
    server.close();
  }
}

runTestSuite();
