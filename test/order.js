//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let api = require('../src/routes').default;
let should = chai.should();

chai.use(chaiHttp);
//Our parent block
describe('Orders', () => {
    beforeEach((done) => {
        //Before each test we empty the database in your case
        done();
    });
    /*
     * Test the /GET route
     */
    describe('/GET waitting order', () => {
        it('it should GET all the watting order', (done) => {
            chai.request(api)
                .get('/order')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    // res.body.length.should.be.eql(9); // fixme :)
                    // done();
                });
        });
    });
});
