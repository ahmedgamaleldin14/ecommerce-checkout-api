const chai = require('chai');
const chaiHttp = require('chai-http');

chai.use(chaiHttp);
const app = require('../app');
const request = require('supertest')(app);
const should = chai.should();
const { expect } = chai;

describe('GET /api/items/:id', () => {
  it('should return an item corresponding to the id when called', (done) => {
    const id = '61640b17afc5db08eeb3ce04';
    const expectedItem = {
      data: {
        _id: '61640b17afc5db08eeb3ce04',
        isAvailable: true,
        name: 'Apple',
        serialNumber: 'abc-123',
        price: 10,
        quantity: 5,
        __v: 0,
      },
    };
    chai
      .request(app)
      .get(`/api/items/${id}`)
      .end((err, res) => {
        console.log(res);
        res.should.have.status(200);
        expect(res.body).to.deep.equal(expectedItem);
        done();
      });
  });
});
