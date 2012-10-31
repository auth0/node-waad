var assert = require('assert')
	, auth = require("../lib/auth")
	, waad = require("../lib/waad")
	, config = require('./config');

describe('query graph', function () {
	var access_token;
	before(function(done) {
    	auth.getAccessToken(config.TENANTID, config.APPPRINCIPALID, config.SYMMETRICKEY, function(err, token) {
    		access_token = token;
    		done(); 
    	});
	});

    it('should get user by email', function (done) {
		waad.getUserByEmail(access_token, 'matias@auth10dev.onmicrosoft.com', function(err, user) {
			assert.notEqual(null, user);
			assert.equal('matias@auth10dev.onmicrosoft.com', user.Mail);
			assert.equal('Matias Woloski', user.DisplayName);
			done();
		});
	});

	it('should return null if user not found', function (done) {
		waad.getUserByEmail(access_token, 'nonexising@auth10dev.onmicrosoft.com', function(err, user) {
			assert.equal(null, user);
			done();
		});
	});

	it('should fail if access_token is wrong', function (done) {
		waad.getUserByEmail('wrong-token', 'nonexising@auth10dev.onmicrosoft.com', function(err, user) {
			assert.notEqual(null, err);
			assert.equal('Authentication_Unauthorized', JSON.parse(err.message).error.code);
			done();
		});
	});

	it('should get groups by user', function (done) {
		waad.getGroupsForUserByEmail(access_token, 'matias@auth10dev.onmicrosoft.com', function(err, groups) {
			assert.notEqual(null, groups);
			assert.equal('Test Group', groups[0].DisplayName);
			assert.equal('Company Administrator', groups[1].DisplayName);
			done();
		});
	});
});