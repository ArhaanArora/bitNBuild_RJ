async function testEndpoints() {
  const urls = [
    'http://localhost:6969/dashboard',
    'http://localhost:6969/hiring',
    'http://localhost:6969/hiring?tab=hire',
    'http://localhost:6969/hiring?tab=get-hired',
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url);
      console.log(`[PASS] ${url} -> HTTP ${res.status}`);
      const text = await res.text();
      console.log(`       Length: ${text.length} bytes, includes root: ${text.includes('id="root"')}`);
    } catch (err) {
      console.error(`[FAIL] ${url} ->`, err.message);
    }
  }
}

testEndpoints();
