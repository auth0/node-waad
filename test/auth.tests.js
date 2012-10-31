var assert = require('assert')
	, waad = require("../lib/auth")
	, config = require('./config');

describe('login to waad', function () {
    it('should obtain an access token', function (done) {
    	waad.auth(config.TENANTID, config.APPPRINCIPALID, config.SYMMETRICKEY, function(err, token) {
    		if (err) {
    			console.log(err);
    		}

    		assert.notEqual(null, token);
    		done();
    	});
    });

    it('should fail for wrong tenantId', function (done) {
    	waad.auth('wrong-tenant-id', config.APPPRINCIPALID, config.SYMMETRICKEY, function(err, token) {
			assert.equal('The requested namespace does not exist.', err.message);
			done();
    	});
    });

    it('should fail for wrong service principal', function (done) {
    	waad.auth(config.TENANTID, 'wrong-principal', config.SYMMETRICKEY, function(err, token) {
			assert.ok(err.message.indexOf('ACS50027') > -1);
			done();
    	});
    });

    it('should fail for wrong service key', function (done) {
    	waad.auth(config.TENANTID, config.APPPRINCIPALID, 'wrong-key', function(err, token) {
			assert.ok(err.message.indexOf('ACS50027') > -1);
			done();
    	});
    });
});