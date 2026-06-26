import http from 'http';

const get = (path) => new Promise((resolve, reject) => {
  const req = http.request({
    hostname: 'localhost', port: 5000, path: `/api${path}`, method: 'GET'
  }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(data) }));
  });
  req.on('error', reject);
  req.end();
});

try {
  const res = await get('/catalog/coupons/public');
  console.log('STATUS:', res.status);
  console.log('COUPONS:', JSON.stringify(res.body, null, 2));
} catch (e) {
  console.error('ERROR:', e);
}
