const request = require('supertest');
const { expect } = require('chai');

require('./setup');

const sweetId = 101;

it('should purchase the sweet successfully', async () => {
  const res = await request(global.app)
    .post(`/api/sweets/${sweetId}/purchase`)
    .send({ qty: 2 });

  expect(res.status).to.equal(200);
  expect(res.body.message).to.equal('Purchase successful');
  expect(res.body.sweet.quantity).to.equal(8);
});
