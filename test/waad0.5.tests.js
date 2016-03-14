var assert = require('assert')
  , auth = require("../lib/auth")
  , Waad = require("../lib/waad")
  , config = require('./config');


describe('query graph', function () {
  before(function(done) {
    this.tenant = config.v1.TENANTID;
    this.upn = config.v1.UPN;

    auth.getAccessToken(config.v1.TENANTID, config.v1.APPPRINCIPALID, config.v1.SYMMETRICKEY, function(err, token) {
      if (err) return done(err)
      this.accessToken = token;
      done();
    }.bind(this));
  });

  allQueryTests.bind(this)();
});

describe('query graph using token obtained with new WAAD release 2013-04', function () {
  before(function(done) {

    this.tenant = config.v2.WAAD_TENANTDOMAIN;
    this.upn = config.v2.UPN;

    auth.getAccessTokenWithClientCredentials2(config.v2.WAAD_TENANTDOMAIN, config.v2.WAAD_CLIENTID, config.v2.WAAD_CLIENTSECRET, function(err, token) {
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
      assert.equal(config.user.displayName, user.DisplayName);
      done();
    }.bind(this));
  });

  it('should return null if user not found', function (done) {
    var waad = new Waad({tenant: this.tenant, accessToken: this.accessToken});
    waad.getUserByProperty('UserPrincipalName', config.invalid_email, function(err, user) {
      assert.equal(null, user);
      done();
    });
  });

  it('should fail if accessToken is wrong', function (done) {
    var waad = new Waad({tenant: this.tenant, accessToken: 'foobarbazbarbiz'});
    waad.getUserByProperty('UserPrincipalName', config.invalid_email, function(err) {
      assert.notEqual(null, err);
      assert.equal('Authentication_MissingOrMalformed', JSON.parse(err.message).error.code);
      done();
    });
  });

  it('should get groups by user upn', function (done) {
    var waad = new Waad({tenant: this.tenant, accessToken: this.accessToken});
    waad.getGroupsForUserByProperty('UserPrincipalName', this.upn, function(err, groups) {
      if (err) return done(err);
      assert.notEqual(null, groups);
      config.user.groups.forEach(function (group) {
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
    waad.getUserByProperty('UserPrincipalName', this.upn, { includeGroups: true }, function(err, user) {
      assert.notEqual(null, user);
      assert.equal(this.upn, user.UserPrincipalName);
      assert.equal(config.user.displayName, user.DisplayName);
      assert.notEqual(null, user.groups);
      config.user.groups.forEach(function (group) {
        assert.equal(1, user.groups.filter(function(g){ return g.DisplayName === group; }).length, group);
      });
      done();
    }.bind(this));
  });

}
