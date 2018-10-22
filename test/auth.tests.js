var assert = require('assert')
  , auth = require("../lib/auth")
  , config = require('./config');

describe('login to waad', function () {
  it('should obtain an access token', function (done) {
    auth.getAccessToken(config.v1.TENANTID, config.v1.APPPRINCIPALID, config.v1.SYMMETRICKEY, function(err, token) {
      if (err) {
        console.log(err);
        return done(err);
      }

      assert.notEqual(null, token);
      done();
    });
  });

  it('should fail for wrong tenantId', function (done) {
    auth.getAccessToken('wrong-tenant-id', config.v1.APPPRINCIPALID, config.v1.SYMMETRICKEY, function(err, token) {
      assert.ok(err.message.indexOf('AADSTS90002: No service namespace named \'wrong-tenant-id\' was found in the data store.'));
      done();
    });
  });

  it('should fail for wrong service principal', function (done) {
    auth.getAccessToken(config.v1.TENANTID, 'wrong-principal', config.v1.SYMMETRICKEY, function(err, token) {
      assert.ok(err.message.indexOf('AADSTS70001: Application with identifier \'wrong-principal\' was not found in the directory') > -1);
      done();
    });
  });

  it('should fail for wrong service key', function (done) {
    auth.getAccessToken(config.v1.TENANTID, config.v1.APPPRINCIPALID, 'wrong-key', function(err, token) {
      assert.ok(err.message.indexOf('AADSTS70002: Error validating credentials. AADSTS50012: Client assertion contains an invalid signature.') > -1);
      done();
    });
  });
});
