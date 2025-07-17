const request = require('supertest');
const { expect } = require('chai');

require('./setup');

const sweetId = 101;

it('should fail when trying to purchase more than stock', async () => {
  const res = await request(global.app)
    .post(`/api/sweets/${sweetId}/purchase`)
    .send({ qty: 100 });

  expect(res.status).to.equal(400);
  expect(res.body.error).to.include('Not enough stock');
});
