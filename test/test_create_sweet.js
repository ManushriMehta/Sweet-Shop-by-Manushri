const request = require('supertest');
const { expect } = require('chai');

require('./setup'); // Ensure setup is run

const sweetId = 101;

it('should create a new sweet', async () => {
  const res = await request(global.app)
    .post('/api/sweets')
    .send({
      id: sweetId,
      name: 'Kaju Katli',
      category: 'Traditional',
      price: 500,
      quantity: 10
    });

  expect(res.status).to.equal(201);
  expect(res.body).to.have.property('name', 'Kaju Katli');
  expect(res.body.quantity).to.equal(10);
});
