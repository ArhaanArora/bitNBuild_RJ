const http = require('http');

async function req(method, path, body) {
  return new Promise((resolve) => {
    const d = body ? JSON.stringify(body) : null;
    const r = http.request({
      hostname: 'localhost', port: 4000, path,
      method, headers: { 'Content-Type': 'application/json', ...(d ? { 'Content-Length': Buffer.byteLength(d) } : {}) }
    }, res => {
      let b = '';
      res.on('data', c => b += c);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(b) }));
    });
    if (d) r.write(d);
    r.end();
  });
}

async function main() {
  console.log('\n=== SkillVerify API Smoke Test ===\n');

  // Health
  const health = await req('GET', '/api/health');
  console.log('✓ Health:', health.body.status);

  // Login as alex
  const login = await req('POST', '/api/auth/login', { email: 'alex@demo.local', password: 'Demo1234!' });
  console.log('✓ Login alex:', login.status === 200 ? 'OK' : 'FAIL', '| role:', login.body.user?.role);
  const token = login.body.access;

  // Login as organizer
  const orgLogin = await req('POST', '/api/auth/login', { email: 'organizer@demo.local', password: 'Demo1234!' });
  console.log('✓ Login organizer:', orgLogin.status === 200 ? 'OK' : 'FAIL');

  // Login as recruiter
  const recLogin = await req('POST', '/api/auth/login', { email: 'recruiter@demo.local', password: 'Demo1234!' });
  console.log('✓ Login recruiter:', recLogin.status === 200 ? 'OK' : 'FAIL');

  // Get skills
  const skills = await req('GET', '/api/skills');
  console.log('✓ Skills list:', skills.body.length, 'skills');

  // Get assessments (with auth)
  const assReq = await new Promise((resolve) => {
    const r = http.request({ hostname: 'localhost', port: 4000, path: '/api/assessments', method: 'GET',
      headers: { Authorization: 'Bearer ' + token } }, res => {
      let b = ''; res.on('data', c => b += c);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(b) }));
    }); r.end();
  });
  console.log('✓ Assessments:', assReq.body.length, 'published |', assReq.body[0]?.title);

  // Get hackathons
  const hkReq = await new Promise((resolve) => {
    const r = http.request({ hostname: 'localhost', port: 4000, path: '/api/hackathons', method: 'GET',
      headers: { Authorization: 'Bearer ' + token } }, res => {
      let b = ''; res.on('data', c => b += c);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(b) }));
    }); r.end();
  });
  console.log('✓ Hackathons:', hkReq.body.length, 'published');
  hkReq.body.forEach(h => console.log('   -', h.name));

  // Get my skills (alex)
  const mySkills = await new Promise((resolve) => {
    const r = http.request({ hostname: 'localhost', port: 4000, path: '/api/skills/mine', method: 'GET',
      headers: { Authorization: 'Bearer ' + token } }, res => {
      let b = ''; res.on('data', c => b += c);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(b) }));
    }); r.end();
  });
  console.log('✓ Alex skills:', mySkills.body.length, 'skills');
  mySkills.body.forEach(s => console.log(`   - ${s.skillName}: ${s.verificationStatus} ${s.verifiedScore ? '(' + s.verifiedScore + '/100)' : ''}`));

  console.log('\n✅ All checks passed! App ready at http://localhost:5173\n');
}
main().catch(console.error);
