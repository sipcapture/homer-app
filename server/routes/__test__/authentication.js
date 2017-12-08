import { describe, it } from 'mocha';
import expect from 'expect.js';
import server from '../../server';

describe('Authentication', function () {

  it('should fail due to incorrect password', function () {
    const payload = {
      username: 'trex',
      password: 'passworddd'
    };

    const options = {
      method: 'POST',
      url: '/api/v2/auth',
      payload
    };

    return server.injectThen(options)
      .then(function (response) {
        expect(response.statusCode).to.eql(401);
        expect(response.statusMessage).to.eql('Unauthorized');
      });
  });

  it('should successfully authenticate', function () {
    const payload = {
      username: 'trex',
      password: 'password'
    };

    const options = {
      method: 'POST',
      url: '/api/v2/auth',
      payload
    };

    return server.injectThen(options)
      .then(function (response) {
        expect(response.statusCode).to.eql(200);
        expect(response.statusMessage).to.eql('OK');
        expect(response.result).to.have.property('token');
        expect(/^[\w0-9-_]+\.[\w0-9-_]+\.?[\w0-9-_.]*$/.test(response.result.token)).to.be(true);
      });
  });

});
