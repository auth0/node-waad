var assert = require('assert')
  , auth = require("../lib/auth")
  , Waad = require("../lib/waad10")
  , config = require('./config');


describe('query graph api-version 1.0', function () {
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
  it('should get user by upn', function (done) {
    var waad = new Waad({tenant: this.tenant, accessToken: this.accessToken});
    waad.getUserByProperty('userPrincipalName', this.upn, function(err, user) {
      if(err) return done(err);
      assert.equal(this.upn, user.userPrincipalName);
      assert.equal(config.user.displayName, user.displayName);
      assert.equal(undefined, user.groups);
      done();
    }.bind(this));
  });

  it('should return null if user not found', function (done) {
    var waad = new Waad({tenant: this.tenant, accessToken: this.accessToken});
    waad.getUserByProperty('userPrincipalName', config.invalid_email, function(err, user) {
      assert.equal(null, user);
      done();
    });
  });

  it('should fail if accessToken is wrong', function (done) {
    var waad = new Waad({tenant: this.tenant, accessToken: 'foobarbazbarbiz'});
    waad.getUserByProperty('userPrincipalName', config.invalid_email, function(err) {
      assert.notEqual(null, err);
      assert.equal('Authentication_MissingOrMalformed', JSON.parse(err.message)['odata.error'].code);
      done();
    });
  });

  it('should get groups by user upn', function (done) {
    var waad = new Waad({tenant: this.tenant, accessToken: this.accessToken});
    waad.getGroupsForUserByObjectIdOrUpn(this.upn, function(err, groups) {
      assert.notEqual(null, groups);
      config.user.groups.forEach(function (group) {
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
    waad.getUserByProperty('userPrincipalName', this.upn, { includeGroups: true}, function(err, user) {
      assert.notEqual(null, user);
      assert.equal(this.upn, user.userPrincipalName);
      assert.equal(config.user.displayName, user.displayName);
      assert.notEqual(undefined, user.groups);
      config.user.groups.forEach(function (group) {
        assert.equal(1, user.groups.filter(function(g){ return g.displayName === group; }).length, group);
      });
      done();
    }.bind(this));
  });

  it('should get user with groups by arbitrary property with type Edm.Guid', function (done) {
    var waad = new Waad({tenant: this.tenant, accessToken: this.accessToken});
    waad.getUserByProperty('objectId', config.user.objectId, { includeGroups: true}, function(err, user) {
      if (err) return done(err);
      assert.notEqual(null, user);
      assert.equal(this.upn, user.userPrincipalName);
      assert.equal(config.user.displayName, user.displayName);
      assert.notEqual(undefined, user.groups);
      config.user.groups.forEach(function (group) {
        assert.equal(1, user.groups.filter(function(g){ return g.displayName === group; }).length, group);
      });
      done();
    }.bind(this));
  });

  it('should get user with all groups by arbitrary property with type Edm.Guid', function (done) {
    var waad = new Waad({tenant: this.tenant, accessToken: this.accessToken});
    waad.getUserByProperty('objectId', config.user.objectId, { includeGroups: true, includeNestedGroups: true }, function(err, user) {
      if (err) return done(err);
      assert.notEqual(null, user);
      assert.equal(this.upn, user.userPrincipalName);
      assert.equal(config.user.displayName, user.displayName);
      assert.notEqual(undefined, user.groups);
      config.user.allGroups.forEach(function (group) {
        assert.equal(1, user.groups.filter(function(g){ return g.displayName === group; }).length, group);
      });
      done();
    }.bind(this));
  });
}
