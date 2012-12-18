var request = require('request'),
  async = require('async');

module.exports = Waad;

function Waad(options) {
  options = options || {};
  this.options = options;
  
  if (!this.options.tenant) {
    return callback(new Error('Must supply "tenant" id (16a88858-..2d0263900406) or domain (mycompany.onmicrosoft.com)'), null);
  }

  if (!this.options.accessToken) {
    return callback(new Error('Must supply "accessToken"'), null);
  }

  if (this.options.fiddler) {
    request = request.defaults({'proxy':'http://127.0.0.1:8888'});
  }
}

Waad.prototype.__queryUserGroup = function (user, headers, callback) {
  request({
    url: user.MemberOf.__deferred.uri, 
    headers: headers
  }, function(err, resp, body) {
    if (err) return callback(err, null);
        
    if (resp.statusCode != 200) {
      return callback(new Error(body), null);
    }

    var groups = JSON.parse(body).d.results;
    return callback(null, groups);
  });
};

Waad.prototype.__queryUsers = function (qs, include_groups, callback) {
  if (typeof(include_groups) === 'function') {
    callback = include_groups;
    include_groups = false;
  }

  //https://directory.windows.net/16a88858-4384-44f0-9629-2d0263900406/Users()?$filter=Mail%20eq%20'themeail@blah.com'&$top=1


  var headers = {
      'Authorization': 'Bearer ' + this.options.accessToken,
      'Accept': 'application/json;odata=verbose;charset=utf-8',
      'x-ms-dirapi-data-contract-version': '0.5'
  };

  request({
    url: 'https://graph.windows.net/' + this.options.tenant + '/Users()', 
    qs: qs, 
    headers: headers
  }, function(err, resp, body) {
    if (err) return callback(err, null);
        
    if (resp.statusCode != 200) {
      return callback(new Error(body), null);
    }

    var users = JSON.parse(body).d.results;
    if (!users)
      return callback(null, null);

    if (!include_groups)
      return callback(null, users);

    async.forEach(users, function (user, callback) {
      this.__queryUserGroup(user, headers, function (err, groups) {
        if(err) return callback(err);
        user.groups = groups;
        callback();
      });
    }.bind(this), function (err) {
      if (err) return callback(err);
      return callback(null, users);
    });
  }.bind(this));
};


Waad.prototype.getUserByEmail = function (email, include_groups, callback) {
  if (typeof(include_groups) === 'function') {
    callback = include_groups;
    include_groups = false;
  }
  var qs = {
    "$filter": "Mail eq '" + email + "'",
    "$top" : 1
  };
  return this.__queryUsers(qs, include_groups, function (err, users) {
    if(err) return callback(err);
    return callback(null, users[0]);
  });
};

Waad.prototype.getUserByProperty = function (access_token, tenant, propertyName, propertyValue, include_groups, callback) {
	if (typeof(include_groups) === 'function') {
		callback = include_groups;
		include_groups = false;
	}
	var qs = {
		"$filter": propertyName + " eq '" + propertyValue + "'",
		"$top" : 1
	};
	return queryUsers(access_token, tenant, qs, include_groups, function (err, users) {
		if(err) return callback(err);
		return callback(null, users[0]);
	});
};

Waad.prototype.getUsers = function (options, callback) {
  var qs = {}, 
    include_groups;

  if(typeof options === 'object'){
    Object.keys(options)
      .filter(function (k) {
        return ~['skip', 'top', 'orderby'].indexOf(k);
      })
      .forEach(function (k){
        qs['$' + k] = options[k];
      });

    console.log(qs);
    
    include_groups = options.includeGroups;
  } else {
    qs = {};
    include_groups = options;
  }
  return this.__queryUsers(qs, include_groups, callback);
};

Waad.prototype.getGroupsForUserByEmail = function(email, callback) {
  this.getUserByEmail(email, true, function (err, user) {
    if (err) return callback(err);
    if (!user) return callback(null, null);
    return callback(null, user.groups);
  });
};



