/**
 * Comprehensive Page & Endpoint Speed / Blank Page Diagnostic
 */
const http = require('http');

function req(method, path, body, token) {
  return new Promise((resolve) => {
    const start = process.hrtime.bigint();
    const isClient = path.startsWith('/client:');
    const realPath = isClient ? path.replace('/client:', '') : path;
    const port = isClient ? 6969 : 6970;

    const opts = {
      hostname: 'localhost',
      port,
      path: realPath,
      method,
      headers: {
        'Accept': 'application/json, text/html, */*',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { 'Authorization': 'Bearer ' + token } : {}),
      },
      timeout: 5000,
    };

    const r = http.request(opts, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        const ms = Number(process.hrtime.bigint() - start) / 1_000_000;
        resolve({
          status: res.statusCode,
          ms: Math.round(ms * 10) / 10,
          len: data.length,
          preview: data.substring(0, 100).replace(/\s+/g, ' '),
        });
      });
    });

    r.on('error', (err) => {
      const ms = Number(process.hrtime.bigint() - start) / 1_000_000;
      resolve({ status: 'ERR', ms: Math.round(ms * 10) / 10, len: 0, preview: err.message });
    });

    if (body) r.write(JSON.stringify(body));
    r.end();
  });
}

async function run() {
  console.log('\n======================================================');
  console.log('       SKILLVERIFY ALL-PAGES SPEED & CRASH CHECK      ');
  console.log('======================================================\n');

  // 1. Check Client HTML routes (Vite dev server)
  console.log('--- [1] VITE CLIENT PAGES (Instant HTML Loading) ---');
  const clientRoutes = [
    '/',
    '/login',
    '/signup',
    '/dashboard',
    '/skills',
    '/projects',
    '/hackathons',
    '/hackathons/find-teammates',
    '/profile',
    '/admin/login',
    '/admin/dashboard',
  ];

  for (const route of clientRoutes) {
    const res = await req('GET', '/client:' + route);
    const speedIcon = res.ms < 20 ? '⚡' : res.ms < 100 ? '✅' : '🟡';
    const ok = res.status === 200 && res.len > 500;
    console.log(`  ${ok ? '✅' : '❌'} ${speedIcon} [${res.status}] ${route.padEnd(28)} : ${res.ms}ms (${res.len} bytes)`);
  }

  // 2. Candidate Login
  console.log('\n--- [2] CANDIDATE AUTHENTICATION ---');
  const loginRes = await req('POST', '/api/auth/login', {
    email: 'test.candidate@skillverify.local',
    password: 'Password123!',
  });
  let token = null;
  try {
    const b = JSON.parse(loginRes.preview + '...');
  } catch(e) {}
  // parse token from actual response
  const fullLogin = await new Promise(res => {
    const r = http.request({
      hostname: 'localhost', port: 6970, path: '/api/auth/login', method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, response => {
      let d = ''; response.on('data', c => d += c);
      response.on('end', () => res(JSON.parse(d)));
    });
    r.write(JSON.stringify({ email: 'test.candidate@skillverify.local', password: 'Password123!' }));
    r.end();
  });
  token = fullLogin.access;
  console.log(`  ✅ Candidate Logged in successfully. User ID: ${fullLogin.user.id}`);

  // 3. Check all Page Data Endpoints (Cold vs Cached Speed)
  console.log('\n--- [3] PAGE DATA BACKEND LOAD SPEEDS ---');
  const endpoints = [
    { name: 'Home/Dashboard User Context', path: '/api/auth/me' },
    { name: 'My Skills Page (All Skills)', path: '/api/skills' },
    { name: 'My Skills (Repeat - Cache)', path: '/api/skills' },
    { name: 'Candidate Verified Skills', path: '/api/skills/candidate/' + fullLogin.user.id },
    { name: 'My Projects Page', path: '/api/projects' },
    { name: 'Hackathons List', path: '/api/hackathons' },
    { name: 'Notifications Bell', path: '/api/notifications' },
  ];

  for (const ep of endpoints) {
    const res = await req('GET', ep.path, null, token);
    const speedIcon = res.ms <= 10 ? '⚡ (FAST <10ms)' : res.ms <= 50 ? '✅ (<50ms)' : '🟡';
    const isBlank = res.len === 0 || res.status >= 500;
    console.log(`  ${isBlank ? '❌ BLANK/CRASH' : '✅'} ${speedIcon} [${res.status}] ${ep.name.padEnd(30)} : ${res.ms}ms (${res.len} B)`);
    if (isBlank) console.log(`      Error detail: ${res.preview}`);
  }

  // 4. Check Admin endpoints
  console.log('\n--- [4] ADMIN SPEED & INTEGRITY ---');
  const adminLogin = await new Promise(res => {
    const r = http.request({
      hostname: 'localhost', port: 6970, path: '/api/admin/auth/login', method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, response => {
      let d = ''; response.on('data', c => d += c);
      response.on('end', () => {
        try { res(JSON.parse(d)); } catch(e) { res({}); }
      });
    });
    r.write(JSON.stringify({ email: 'admin@demo.local', password: 'password' }));
    r.end();
  });

  if (adminLogin.token) {
    const adminOverview1 = await req('GET', '/api/admin/overview', null, adminLogin.token);
    const adminOverview2 = await req('GET', '/api/admin/overview', null, adminLogin.token);
    console.log(`  ✅ Admin Overview (Cold):   ${adminOverview1.ms}ms (${adminOverview1.len} B)`);
    console.log(`  ⚡ Admin Overview (Cached): ${adminOverview2.ms}ms (${adminOverview2.len} B)`);
  }

  console.log('\n======================================================');
  console.log('              DIAGNOSTIC TEST COMPLETE                ');
  console.log('======================================================\n');
}

run();
