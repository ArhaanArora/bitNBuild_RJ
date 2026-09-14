const http = require('http');

function fetch(url) {
  return new Promise((resolve) => {
    http.get('http://127.0.0.1:6969' + url, (res) => {
      let d = '';
      res.on('data', (c) => (d += c));
      res.on('end', () => resolve({ status: res.statusCode, data: d, headers: res.headers }));
    }).on('error', (err) => resolve({ status: 500, error: err.message }));
  });
}

async function test() {
  console.log('--- Testing index.html ---');
  const index = await fetch('/');
  console.log('index.html status:', index.status, 'bytes:', index.data.length);

  console.log('\n--- Testing /src/main.tsx ---');
  const main = await fetch('/src/main.tsx');
  console.log('/src/main.tsx status:', main.status, 'bytes:', main.data.length);

  console.log('\n--- Testing /src/App.tsx ---');
  const app = await fetch('/src/App.tsx');
  console.log('/src/App.tsx status:', app.status, 'bytes:', app.data.length);

  // Check imports in main.tsx
  const mainImports = main.data.match(/from\s+["'][^"']+["']/g) || [];
  for (const imp of mainImports) {
    const raw = imp.replace(/from\s+["']/, '').replace(/["']$/, '');
    const url = raw.startsWith('/') ? raw : raw.startsWith('.') ? '/src/' + raw.replace(/^\.\//, '') : '/@fs/' + raw;
    const res = await fetch(url);
    if (res.status !== 200) {
      console.log('❌ Failed import in main.tsx:', raw, '-> status', res.status, res.data.substring(0, 150));
    } else {
      console.log('✅ Import in main.tsx:', raw, '-> 200');
    }
  }

  // Check imports in App.tsx
  const appImports = app.data.match(/from\s+["'][^"']+["']/g) || [];
  for (const imp of appImports) {
    const raw = imp.replace(/from\s+["']/, '').replace(/["']$/, '');
    const url = raw.startsWith('/') ? raw : raw.startsWith('.') ? '/src/' + raw.replace(/^\.\//, '') : '/@fs/' + raw;
    const res = await fetch(url);
    if (res.status !== 200) {
      console.log('❌ Failed import in App.tsx:', raw, '-> status', res.status, res.data.substring(0, 150));
    } else {
      console.log('✅ Import in App.tsx:', raw, '-> 200');
    }
  }
}

test();
