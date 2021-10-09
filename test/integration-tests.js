const chai = require('chai');
const mongoose = require('mongoose');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const server = require('../app');
const should = chai.should();
const { expect } = chai;

describe('GET /api/items/:id', () => {
  it('should return a list of items when called', (done) => {
    const id = '615f63f7f70f37d0d7bf3053';
    const expectedItem = { x: 'y' };
    chai
      .request(server)
      .get(`/api/items/${id}`)
      .end((err, res) => {
        res.should.have.status(200);
        expect(res.body).to.deep.equal(expectedItem);
        done();
      });
  }).timeout(10000);
});
