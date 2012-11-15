var assert = require('assert')
	, auth = require("../lib/auth")
	, Waad = require("../lib/waad")
	, config = require('./config')
	, waad = new Waad(/*{fiddler: true}*/);

describe('query graph', function () {
	var access_token;
	before(function(done) {
    	auth.getAccessToken(config.TENANTID, config.APPPRINCIPALID, config.SYMMETRICKEY, function(err, token) {
    		access_token = token;
    		done(); 
    	});
	});

    it('should get user by email', function (done) {
		waad.getUserByEmail(access_token, config.TENANTID, 'matias@auth10dev.onmicrosoft.com', function(err, user) {
			assert.notEqual(null, user);
			assert.equal('matias@auth10dev.onmicrosoft.com', user.Mail);
			assert.equal('Matias Woloski', user.DisplayName);
			done();
		});
	});

	it('should return null if user not found', function (done) {
		var waad = new Waad({tenant: config.TENANTID});
		waad.getUserByEmail(access_token, config.TENANTID, 'nonexising@auth10dev.onmicrosoft.com', function(err, user) {
			assert.equal(null, user);
			done();
		});
	});

	it('should fail if access_token is wrong', function (done) {
		var waad = new Waad({tenant: config.TENANTID});
		waad.getUserByEmail('wrong-token', config.TENANTID, 'nonexising@auth10dev.onmicrosoft.com', function(err, user) {
			assert.notEqual(null, err);
			assert.equal('Authentication_Unauthorized', JSON.parse(err.message).error.code);
			done();
		});
	});

	it('should get groups by user', function (done) {
		var waad = new Waad({tenant: config.TENANTID});
		waad.getGroupsForUserByEmail(access_token, config.TENANTID, 'matias@auth10dev.onmicrosoft.com', function(err, groups) {
			assert.notEqual(null, groups);
			assert.equal('Test Group', groups[0].DisplayName);
			assert.equal('Company Administrator', groups[1].DisplayName);
			done();
		});
	});
});

describe('query graph using token obtained with client credentials', function () {
	var access_token2;
	before(function(done) {
        auth.getAccessTokenWithClientCredentials(config.TENANTDOMAIN, config.APPDOMAIN, config.CLIENTID, config.CLIENTSECRET, function(err, token) {
    		access_token2 = token;
    		done();
    	});
	});

    it('should get user by email', function (done) {
		waad.getUserByEmail(access_token2, config.TENANTDOMAIN, 'matias@thesuperstore.onmicrosoft.com', function(err, user) {
			assert.notEqual(null, user);
			assert.equal('matias@thesuperstore.onmicrosoft.com', user.Mail);
			assert.equal('Matias Woloski', user.DisplayName);
			done();
		});
	});

	it('should return null if user not found', function (done) {
		waad.getUserByEmail(access_token2, config.TENANTDOMAIN, 'nonexising@thesuperstore.onmicrosoft.com', function(err, user) {
			assert.equal(null, user);
			done();
		});
	});

	it('should fail if access_token is wrong', function (done) {
		waad.getUserByEmail('wrong-token', config.TENANTDOMAIN, 'nonexising@thesuperstore.onmicrosoft.com', function(err, user) {
			assert.notEqual(null, err);
			assert.equal('Authentication_Unauthorized', JSON.parse(err.message).error.code);
			done();
		});
	});

	it('should get groups by user', function (done) {
		waad.getGroupsForUserByEmail(access_token2, config.TENANTDOMAIN, 'matias@thesuperstore.onmicrosoft.com', function(err, groups) {
			assert.notEqual(null, groups);
			assert.equal('Test Group', groups[0].DisplayName);
			assert.equal('Company Administrator', groups[1].DisplayName);
			done();
		});
	});

	it('should get user with groups', function (done) {
		waad.getUserByEmail(access_token2, config.TENANTDOMAIN, 'matias@thesuperstore.onmicrosoft.com', true, function(err, user) {
			assert.notEqual(null, user);
			assert.equal('matias@thesuperstore.onmicrosoft.com', user.Mail);
			assert.equal('Matias Woloski', user.DisplayName);
			assert.notEqual(null, user.groups);
			assert.equal('Test Group', user.groups[0].DisplayName);
			assert.equal('Company Administrator', user.groups[1].DisplayName);
			done();
		});
	});
});