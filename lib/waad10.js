var request = require('request');
var async   = require('async');

module.exports = Waad10;

function Waad10(options) {
  options = options || {};
  this.options = options;
  this.baseUrl = 'https://graph.windows.net/';
  this.apiVersion = '1.0';

  if (!this.options.tenant) {
    throw new Error('Must supply "tenant" id (16a88858-..2d0263900406) or domain (mycompany.onmicrosoft.com)');
  }

  if (!this.options.accessToken) {
    throw new Error('Must supply "accessToken"');
  }

  if (this.options.fiddler) {
    request = request.defaults({'proxy':'http://127.0.0.1:8888'});
  }

}

Waad10.prototype.__request = function (options, callback) {
  var headers = {
    'Authorization': 'Bearer ' + this.options.accessToken,
  };

  request({
    url: options.url,
    qs: options.qs || {},
    method: options.method || 'GET',
    json : options.json,
    headers: headers
  }, function(err, resp, body) {
    if (err) return callback(err, null);

    if (resp.statusCode !== 200) {
      return callback(new Error(body), null);
    }

    var array = body;

    if (typeof body === 'string'){
      try {
        array = JSON.parse(body);
      } catch (e){
        return callback(new Error('Failed to parse response from graph API'));
      }
    }

    if (!array && array.value && array.value.length === 0)
      return callback();

    return callback(null, array.value);
  }.bind(this));
};

Waad10.prototype.__queryNestedUserGroups = function (objectIdOrUpn, callback) {
  var qs = {
    "api-version": this.apiVersion,
    "$top": this.options.maxGroupsToRetrieve || 250
  };

  this.__request({
    url: this.baseUrl + this.options.tenant + '/users/' + objectIdOrUpn + '/getMemberGroups',
    qs: qs,
    method: 'POST',
    json: { "securityEnabledOnly" : false }
  }, function(err, groups){
    if (err || !groups) return callback(err);

    return this.__getObjectsByObjectIds(groups, callback)
  }.bind(this));
};

Waad10.prototype.__getObjectsByObjectIds = function (objectIds, callback) {
  var qs = {};
  qs['api-version'] = '1.6';

  this.__request({
    url: this.baseUrl + this.options.tenant + '/getObjectsByObjectIds',
    qs: qs,
    method: 'POST',
    json: {
      "objectIds": objectIds,
      "types": [ "group" ]
    }
  }, callback);
};

Waad10.prototype.__queryUserGroup = function (objectIdOrUpn, callback) {
  var qs = {
    "api-version": this.apiVersion,
    "$top": this.options.maxGroupsToRetrieve || 250
  };

  this.__request({
    url: this.baseUrl + this.options.tenant + '/users/' + objectIdOrUpn + '/memberOf',
    qs: qs
  }, callback);
};

Waad10.prototype.__queryUsers = function (qs, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = options || {};
  }

  qs['api-version'] = this.apiVersion;

  this.__request({
    url: this.baseUrl + this.options.tenant + '/users',
    qs: qs,
  }, function(err, users){
    if (err || !users) return callback(err);

    if (!options || !options.includeGroups) return callback(null, users);


    async.forEach(users, function (user, cb) {
      var groupsCallback = function (err, groups) {
        if (err) return callback(err);
        user.groups = groups;
        cb();
      };

      options.includeNestedGroups ?
        this.__queryNestedUserGroups(user.objectId, groupsCallback) :
        this.__queryUserGroup(user.objectId, groupsCallback);
    }.bind(this), function (err) {
      if (err) return callback(err);
      return callback(null, users);
    });
  }.bind(this));
};

Waad10.prototype.getUserByEmail = function (email, callback) {
  var qs = {
    "$filter": "mail eq '" + email + "'",
    "$top" : 1
  };

  return this.__queryUsers(qs, function (err, users) {
    if(err) return callback(err);
    return callback(null, users[0]);
  });
};

Waad10.prototype.getUserByUpn = function (upn, callback) {
  var qs = {
    "$filter": "userPrincipalName eq '" + upn + "'",
    "$top" : 1
  };

  return this.__queryUsers(qs, function (err, users) {
    if(err) return callback(err);
    return callback(null, users[0]);
  });
};

Waad10.prototype.getUserByProperty = function (propertyName, propertyValue, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  var qs = {
    "$filter": propertyName + " eq '" + propertyValue + "'",
    "$top" : 1
  };

  return this.__queryUsers(qs, options, function (err, users) {
    if (err) return callback(err);
    return callback(null, users[0]);
  });
};

Waad10.prototype.getUsers = function (options, callback) {
  var qs = {};

  if(typeof options === 'object'){
    if (options.top) {
      qs.$top = options.top;
    }

    if (options.skiptoken) {
      qs.$skiptoken = options.skiptoken;
    }
  } else {
    callback = options;
  }

  return this.__queryUsers(qs, callback);
};

Waad10.prototype.getGroupsForUserByObjectIdOrUpn = function(objectIdOrUpn, callback) {
  return this.__queryUserGroup(objectIdOrUpn, callback);
};
