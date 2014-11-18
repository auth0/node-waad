var request = require('request');
var async   = require('async');

module.exports = Waad10;

function Waad10(options) {
  options = options || {};
  this.options = options;
  
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

Waad10.prototype.__queryUserGroup = function (objectIdOrUpn, callback) {
  var headers = {
    'Authorization': 'Bearer ' + this.options.accessToken,
  };

  var qs = {};
  qs['api-version'] = '1.0';

  request({
    url: 'https://graph.windows.net/' + this.options.tenant + '/users/' + objectIdOrUpn + '/memberOf',
    qs: qs,
    headers: headers
  }, function(err, resp, body) {
    if (err) return callback(err, null);
        
    if (resp.statusCode !== 200) {
      return callback(new Error(body), null);
    }

    var groups = JSON.parse(body);

    if (!groups && groups.value && groups.value.length === 0)
      return callback();

    return callback(null, groups.value);
  }.bind(this));
};

Waad10.prototype.__queryUsers = function (qs, includeGroups, callback) {
  if (typeof includeGroups === 'function') {
    callback = includeGroups;
    includeGroups = false;
  }

  var headers = {
    'Authorization': 'Bearer ' + this.options.accessToken,
  };

  qs['api-version'] = '1.0';

  request({
    url: 'https://graph.windows.net/' + this.options.tenant + '/users',
    qs: qs,
    headers: headers
  }, function(err, resp, body) {
    if (err) return callback(err, null);
    if (resp.statusCode !== 200) {
      return callback(new Error(body), null);
    }

    var users = JSON.parse(body);

    if (!users && users.value && users.value.length === 0)
      return callback();

    if (!includeGroups)
      return callback(null, users.value);

    async.forEach(users.value, function (user, cb) {
      this.__queryUserGroup(user.objectId, function (err, groups) {
        if (err) return callback(err);
        user.groups = groups;
        cb();
      });
    }.bind(this), function (err) {
      if (err) return callback(err);
      return callback(null, users.value);
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

Waad10.prototype.getUserByProperty = function (propertyName, propertyValue, includeGroups, callback) {
  if (typeof includeGroups === 'function') {
    callback = includeGroups;
    includeGroups = false;
  }

  var qs = {
    "$filter": propertyName + " eq '" + propertyValue + "'",
    "$top" : 1
  };

  return this.__queryUsers(qs, includeGroups, function (err, users) {
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
