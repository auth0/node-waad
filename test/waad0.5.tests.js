var assert = require('assert')
  , auth = require("../lib/auth")
  , Waad = require("../lib/waad")
  , config = require('./config');


describe('query graph', function () {
  before(function(done) {
    this.tenant = config.TENANTID;
    this.upn = 'matias@auth10dev.onmicrosoft.com';

    auth.getAccessToken(config.TENANTID, config.APPPRINCIPALID, config.SYMMETRICKEY, function(err, token) {
      this.accessToken = token;
      done(); 
    }.bind(this));
  });

  allQueryTests.bind(this)();
});

describe('query graph using token obtained with new WAAD release 2013-04', function () {
  before(function(done) {
    
    this.tenant = config.WAAD_TENANTDOMAIN;
    this.upn = 'matias@auth0waadtests.onmicrosoft.com';

    auth.getAccessTokenWithClientCredentials2(config.WAAD_TENANTDOMAIN, config.WAAD_CLIENTID, config.WAAD_CLIENTSECRET, function(err, token) {
      this.accessToken = token;
      done();
    }.bind(this));
  });

  allQueryTests.bind(this)();
});

function allQueryTests () {
  it('should get user by email', function (done) {
    var waad = new Waad({tenant: this.tenant, accessToken: this.accessToken});
    waad.getUserByProperty('UserPrincipalName', this.upn, function(err, user) {
      if(err) return done(err);  
      assert.notEqual(null, user);
      assert.equal(this.upn, user.UserPrincipalName);
      assert.equal('Matias Woloski', user.DisplayName);
      done();
    }.bind(this));
  });

  it('should return null if user not found', function (done) {
    var waad = new Waad({tenant: this.tenant, accessToken: this.accessToken});
    waad.getUserByProperty('UserPrincipalName', 'nonexising@auth10dev.onmicrosoft.com', function(err, user) {
      assert.equal(null, user);
      done();
    });
  });

  it('should fail if accessToken is wrong', function (done) {
    var waad = new Waad({tenant: this.tenant, accessToken: 'foobarbazbarbiz'});
    waad.getUserByProperty('UserPrincipalName', 'nonexising@auth10dev.onmicrosoft.com', function(err) {
      assert.notEqual(null, err);
      assert.equal('Authentication_MissingOrMalformed', JSON.parse(err.message).error.code);
      done();
    });
  });

  it('should get groups by user upn', function (done) {
    var waad = new Waad({tenant: this.tenant, accessToken: this.accessToken});
    waad.getGroupsForUserByProperty('UserPrincipalName', this.upn, function(err, groups) {
      assert.notEqual(null, groups);
      ['Test Group', 'Company Administrator'].forEach(function (group) {
        assert.equal(1, groups.filter(function(g){ return g.DisplayName === group; }).length, group);
      });
      done();
    });
  });

  it('can get all users', function (done) {
    var waad = new Waad({tenant: this.tenant, accessToken: this.accessToken});
    waad.getUsers(function(err, users) {
      if (err) return done(err);
      assert.notEqual(null, users);
      var length = users.filter(function(u){
        return u.UserPrincipalName === this.upn;
      }.bind(this)).length;

      assert.equal(1, length);
      
      done();
    }.bind(this));
  });

  it('should get user with groups by arbitrary property', function (done) {
    var waad = new Waad({tenant: this.tenant, accessToken: this.accessToken});
    waad.getUserByProperty('UserPrincipalName', this.upn, true, function(err, user) {
      assert.notEqual(null, user);
      assert.equal(this.upn, user.UserPrincipalName);
      assert.equal('Matias Woloski', user.DisplayName);
      assert.notEqual(null, user.groups);
      ['Test Group', 'Company Administrator'].forEach(function (group) {
        assert.equal(1, user.groups.filter(function(g){ return g.DisplayName === group; }).length, group);
      });
      done();
    }.bind(this));
  });

}
