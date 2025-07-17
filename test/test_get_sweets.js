const request = require('supertest');
const { expect } = require('chai');

require('./setup');

it('should return a list of sweets', async () => {
  const res = await request(global.app).get('/api/sweets');
  expect(res.status).to.equal(200);
  expect(res.body).to.be.an('array');
  expect(res.body.length).to.be.greaterThan(0);
});
