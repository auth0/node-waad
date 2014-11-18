var assert = require('assert')
  , auth = require("../lib/auth")
  , Waad = require("../lib/waad10")
  , config = require('./config');


describe('query graph api-version 1.0', function () {
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
  it('should get user by upn', function (done) {
    var waad = new Waad({tenant: this.tenant, accessToken: this.accessToken});
    waad.getUserByProperty('userPrincipalName', this.upn, function(err, user) {
      if(err) return done(err);
      assert.notEqual(null, user);
      assert.equal(this.upn, user.userPrincipalName);
      assert.equal('Matias Woloski', user.displayName);
      assert.equal(undefined, user.groups);
      done();
    }.bind(this));
  });

  it('should return null if user not found', function (done) {
    var waad = new Waad({tenant: this.tenant, accessToken: this.accessToken});
    waad.getUserByProperty('userPrincipalName', 'nonexising@auth10dev.onmicrosoft.com', function(err, user) {
      assert.equal(null, user);
      done();
    });
  });

  it('should fail if accessToken is wrong', function (done) {
    var waad = new Waad({tenant: this.tenant, accessToken: 'foobarbazbarbiz'});
    waad.getUserByProperty('userPrincipalName', 'nonexising@auth10dev.onmicrosoft.com', function(err) {
      assert.notEqual(null, err);
      assert.equal('Authentication_MissingOrMalformed', JSON.parse(err.message)['odata.error'].code);
      done();
    });
  });

  it('should get groups by user upn', function (done) {
    var waad = new Waad({tenant: this.tenant, accessToken: this.accessToken});
    waad.getGroupsForUserByObjectIdOrUpn(this.upn, function(err, groups) {
      assert.notEqual(null, groups);
      ['Test Group', 'Company Administrator'].forEach(function (group) {
        assert.equal(1, groups.filter(function(g){ return g.displayName === group; }).length, group);
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
        return u.userPrincipalName === this.upn;
      }.bind(this)).length;

      assert.equal(1, length);
      
      done();
    }.bind(this));
  });

  it('should get user with groups by arbitrary property', function (done) {
    var waad = new Waad({tenant: this.tenant, accessToken: this.accessToken});
    waad.getUserByProperty('userPrincipalName', this.upn, true, function(err, user) {
      assert.notEqual(null, user);
      assert.equal(this.upn, user.userPrincipalName);
      assert.equal('Matias Woloski', user.displayName);
      assert.notEqual(undefined, user.groups);
      ['Test Group', 'Company Administrator'].forEach(function (group) {
        assert.equal(1, user.groups.filter(function(g){ return g.displayName === group; }).length, group);
      });
      done();
    }.bind(this));
  });

  it('should get user with groups by arbitrary property with type Edm.Guid', function (done) {
    var waad = new Waad({tenant: this.tenant, accessToken: this.accessToken});
    waad.getUserByProperty('objectId', "9f7e9788-8081-4450-8d60-3b835aa2b54b", true, function(err, user) {
      if (err) return done(err);
      assert.notEqual(null, user);
      assert.equal(this.upn, user.userPrincipalName);
      assert.equal('Matias Woloski', user.displayName);
      assert.notEqual(undefined, user.groups);
      ['Test Group', 'Company Administrator'].forEach(function (group) {
        assert.equal(1, user.groups.filter(function(g){ return g.displayName === group; }).length, group);
      });
      done();
    }.bind(this));
  });
}
