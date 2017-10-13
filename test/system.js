require('babel-core/register');
const Lab = require('lab');
const lab = exports.lab = Lab.script();
const expect = require('expect.js');
const server = require('../src/server.js');

lab.experiment('Authentication', function () {
  lab.test('should fail due to incorrect password', function (done) {
    const payload = {
      username: 'trex',
      password: 'passworddd'
    };

    const options = {
      method: 'POST',
      url: '/api/v2/auth',
      payload
    };

    server.inject(options, function (response) {
      expect(response.statusCode).to.eql(401);
      expect(response.statusMessage).to.eql('Unauthorized');
      done();
    });
  });
});
