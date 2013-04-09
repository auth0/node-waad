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

describe('query graph using token obtained with client credentials', function () {
  before(function(done) {
    
    this.tenant = config.TENANTDOMAIN;
    this.upn = 'matias@thesuperstore.onmicrosoft.com';

    auth.getAccessTokenWithClientCredentials(config.TENANTDOMAIN, config.APPDOMAIN, config.CLIENTID, config.CLIENTSECRET, function(err, token) {
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
      assert.equal('Test Group', groups[0].DisplayName);
      assert.equal('Company Administrator', groups[1].DisplayName);
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
      assert.equal('Test Group', user.groups[0].DisplayName);
      assert.equal('Company Administrator', user.groups[1].DisplayName);
      done();
    }.bind(this));
  });

  // it('should return the skip token', function (done) {
  //   waad.getUsers(this.accessToken, config.TENANTDOMAIN, function(err, users) {
  //     assert.notEqual(null, users);
  //     assert.equal('matias@thesuperstore.onmicrosoft.com', users[0].Mail);
  //     assert.equal('Matias Woloski', users[0].DisplayName);
  //     done();
  //   });
  // });

  // it('can get all users with user groups', function (done) {
  //   waad.getUsers(this.accessToken, config.TENANTDOMAIN, true, function(err, users) {
  //     assert.equal('Test Group', users[0].groups[0].DisplayName);
  //     done();
  //   });
  // });

  
  //  * this test actually fail because $skip is not implemented in the odata endpoint
  //  * Expression method 'Skip' is not currently supported.
   
  // it.skip('can get all users with skip option', function (done) {
  //   waad.getUsers(this.accessToken, config.TENANTDOMAIN, {skip: 1}, function(err, users) {
  //     if (err) return done(err);
  //     assert.equal(0, users.length);
  //     done();
  //   });
  // });

  // /*
  //  * Unsupported query expression. Query method sequence: (OrderBy)
  //  */
  // it.skip('can get all users sorted', function (done) {
  //   waad.getUsers(this.accessToken, config.TENANTDOMAIN, {orderby: 'DisplayName'}, function(err, users) {
  //     if (err) return done(err);
  //     assert.equal(1, users.length);
  //     done();
  //   });
  // });
}
