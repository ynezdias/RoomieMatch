const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const jwt = require('jsonwebtoken');
const Profile = require('../src/models/Profile');
const route = require('../src/routes/profileRoutes');

test('profile route accepts the editor bio limit and returns useful validation errors', async () => {
  process.env.JWT_SECRET = 'isolated-profile-route-test-secret';
  const original = Profile.findOneAndUpdate;
  Profile.findOneAndUpdate = async (_filter, data) => {
    const doc = new Profile(data);
    await doc.validate();
    return doc;
  };
  const app = express(); app.use(express.json()); app.use('/profile', route);
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const token = jwt.sign({ id: '507f1f77bcf86cd799439011' }, process.env.JWT_SECRET);
  const put = body => fetch(`http://127.0.0.1:${server.address().port}/profile`, { method: 'PUT', headers: { 'content-type': 'application/json', authorization: 'Bearer ' + token }, body: JSON.stringify(body) });
  try {
    let res = await put({ city: ' Boston ', university: ' Workplace ', aboutMe: 'a'.repeat(1000) });
    assert.equal(res.status, 200); let data = await res.json();
    assert.equal(data.aboutMe.length, 1000); assert.equal(data.city, 'Boston');
    res = await put({ city: 'Boston', university: 'Workplace', aboutMe: 'a'.repeat(1001) });
    assert.equal(res.status, 400); data = await res.json();
    assert.match(data.msg, /1,000/); assert.equal(data.msg, data.message); assert(data.fieldErrors.aboutMe);
    res = await put({ city: ' ', university: '' });
    assert.equal(res.status, 400); data = await res.json(); assert(data.fieldErrors.city && data.fieldErrors.university);
    res = await put({ city: 'Boston', university: 'Workplace', photo: {} });
    assert.equal(res.status, 400); assert.equal((await res.json()).code, 'PROFILE_VALIDATION_ERROR');
  } finally { Profile.findOneAndUpdate = original; await new Promise(resolve => server.close(resolve)); }
});