var assert = require('assert')
  , auth = require("../lib/auth")
  , Waad = require("../lib/waad")
  , config = require('./config')
  , _ = require('lodash');


function mapNames (u) { return u.DisplayName; }

describe('query graph', function () {
  before(function(done) {
    this.tenant = config.TENANTID;
    this.mail = 'matias@auth10dev.onmicrosoft.com';

    auth.getAccessToken(config.TENANTID, config.APPPRINCIPALID, config.SYMMETRICKEY, function(err, token) {
      this.accessToken = token;
      done(); 
    }.bind(this));
  });

  it('should return the skiptoken and hasMorePages token', function (done) {
    var waad = new Waad({tenant: this.tenant, accessToken: this.accessToken});
    waad.getUsers({ top: 2 }, function(err, users) {
      if(err) return done(err);
      assert.notEqual(null, users.skiptoken);
      users.hasMorePages.should.be.true;
      users.length.should.eql(2);
      done();
    }.bind(this));
  });

  it('can get next page with skiptoken', function(done){
    var waad = new Waad({tenant: this.tenant, accessToken: this.accessToken});
    waad.getUsers({ top: 2 }, function(err, users) {
      if(err) return done(err);
      var firstPageNames = users.map(mapNames);

      waad.getUsers({ top: 2, skiptoken: users.skiptoken }, function(err, users) {
        var secondPageNames = users.map(mapNames);
        
        _.uniq(firstPageNames.concat(secondPageNames))
          .length.should.eql(4);

        done();
      });

    }.bind(this));
  });

  it('can get next page with nextpage method', function(done){
    var waad = new Waad({tenant: this.tenant, accessToken: this.accessToken});
    waad.getUsers({ top: 2 }, function(err, users) {
      if(err) return done(err);
      var firstPageNames = users.map(mapNames);

      users.nextPage(function(err, users) {
        var secondPageNames = users.map(mapNames);
        
        _.uniq(firstPageNames.concat(secondPageNames))
          .length.should.eql(4);

        done();
      });

    }.bind(this));
  });

  it('should return with hasMorePages false when running out of pages', function(done){
    var waad = new Waad({tenant: this.tenant, accessToken: this.accessToken});
    waad.getUsers({ top: 2 }, function(err, users) {
      if(err) return done(err);
      users.nextPage(function(err, users) {
        users.nextPage(function(err, users){
          users.hasMorePages.should.be.false;
          done();
        });        
      });

    }.bind(this));
  });

  it('should return all users when all is true', function(done){
    var waad = new Waad({tenant: this.tenant, accessToken: this.accessToken});
    waad.getUsers({ top: 2, all: true }, function(err, users) {
      if(err) return done(err);
      users.length.should.eql(5);
      done();
    }.bind(this));
  });

});