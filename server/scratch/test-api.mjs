import http from 'http';

const post = (path, body, cookie) => new Promise((resolve, reject) => {
  const bodyStr = JSON.stringify(body);
  const req = http.request({
    hostname: 'localhost', port: 5000, path: `/api${path}`, method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(bodyStr), ...(cookie ? { Cookie: cookie } : {}) }
  }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => resolve({ status: res.statusCode, body: data, headers: res.headers }));
  });
  req.on('error', reject);
  req.write(bodyStr);
  req.end();
});

const get = (path, cookie) => new Promise((resolve, reject) => {
  const req = http.request({
    hostname: 'localhost', port: 5000, path: `/api${path}`, method: 'GET',
    headers: { ...(cookie ? { Cookie: cookie } : {}) }
  }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => resolve({ status: res.statusCode, body: data }));
  });
  req.on('error', reject);
  req.end();
});

const login = await post('/auth/admin-login', { email: 'admin@masionjaziz.com', password: 'JazizRoyal@2026!' });
console.log('Login:', login.status, login.body.slice(0, 100));
const cookie = login.headers['set-cookie']?.[0]?.split(';')?.[0];
console.log('Cookie:', cookie ? 'OK' : 'MISSING');

if (cookie) {
  const list = await get('/catalog/admin/coupons', cookie);
  console.log('\nGET /coupons:', list.status, list.body.slice(0, 200));
  
  const create = await post('/catalog/admin/coupons', {
    code: 'TESTAPI10',
    description: '',
    discountType: 'percent',
    value: 10,
    scope: 'all',
    categoryId: null,
    productId: null,
    minimumOrder: 0,
    maximumDiscount: null,
    usageLimit: null,
    perCustomer: false,
    startsAt: null,
    expiresAt: null,
    active: true
  }, cookie);
  console.log('\nPOST /coupons:', create.status, create.body.slice(0, 400));
  
  // List again after create
  if (create.status < 300) {
    const list2 = await get('/catalog/admin/coupons', cookie);
    console.log('\nGET /coupons after create:', list2.status, list2.body.slice(0, 400));
  }
}
