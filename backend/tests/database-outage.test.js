const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('../src/app');

test('database outage returns actionable JSON without issuing buffered login queries', async () => {
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  try {
    const url = `http://127.0.0.1:${server.address().port}`;
    const response = await fetch(url + '/api/auth/login', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.invalid', password: 'test-password' }),
      signal: AbortSignal.timeout(2000),
    });
    assert.equal(response.status, 503);
    assert(response.headers.get('content-type').includes('application/json'));
    assert.equal((await response.json()).code, 'DATABASE_UNAVAILABLE');
    const health = await fetch(url + '/health');
    assert.equal(health.status, 503);
    assert.equal((await health.json()).database, 'unavailable');
  } finally { await new Promise(resolve => server.close(resolve)); }
});
