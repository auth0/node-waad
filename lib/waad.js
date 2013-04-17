var request = require('request'),
  async = require('async'),
  url = require('url'),
  querystring = require('querystring'),
  xtend = require('xtend');

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

Waad.prototype.__queryUsers = function (qs, includeGroups, callback) {
  if (typeof(includeGroups) === 'function') {
    callback = includeGroups;
    includeGroups = false;
  }

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

    var d = JSON.parse(body).d,
      users = d.results,
      meta = buildMetadata(d);

    if (meta.skiptoken) {
      Object.defineProperty(users, 'nextPage', {
        enumerable: false,
        writeable: false,
        value: function (callback) {
          var newQs = xtend({}, qs);
          if (meta.skiptoken) {
            newQs.$skiptoken = meta.skiptoken;
          } else {
            delete newQs.$skiptoken;
          }
          this.__queryUsers(newQs, includeGroups, callback);
        }.bind(this)
      });
      Object.defineProperty(users, 'skiptoken', {
        enumerable: false,
        writeable: false,
        value: meta.skiptoken
      });
    }

    Object.defineProperty(users, 'hasMorePages', {
      enumerable: false,
      writeable: false,
      value: !!meta.skiptoken
    });

    if (!users)
      return callback(null, null);

    if (!includeGroups)
      return callback(null, users, meta);

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

function buildMetadata(d){
  var result = {};
  if (d.__next) {
    var parsedQueryString = querystring.parse(url.parse(d.__next).query),
      skiptoken = parsedQueryString.$skiptoken;
    result.skiptoken = skiptoken;
  }

  return result;
}

Waad.prototype.getUserByEmail = function (email, includeGroups, callback) {
  if (typeof(includeGroups) === 'function') {
    callback = includeGroups;
    includeGroups = false;
  }
  var qs = {
    "$filter": "Mail eq '" + email + "'",
    "$top" : 1
  };
  return this.__queryUsers(qs, includeGroups, function (err, users) {
    if(err) return callback(err);
    return callback(null, users[0]);
  });
};

Waad.prototype.getUserByProperty = function (propertyName, propertyValue, include_groups, callback) {
	if (typeof(include_groups) === 'function') {
		callback = include_groups;
		include_groups = false;
	}
	var qs = {
		"$filter": propertyName + " eq '" + propertyValue + "'",
		"$top" : 1
	};
	return this.__queryUsers(qs, include_groups, function (err, users) {
		if(err) return callback(err);
		return callback(null, users[0]);
	});
};

Waad.prototype.getUsers = function (options, callback) {
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

  var includeGroups = options.includeGroups;
  
  if (options.all) {
    var users = [];
    var fetchPage = function (err, usrs) {
      if (err) return callback(err);
      users = users.concat(usrs);
      if (usrs.hasMorePages) {
        return usrs.nextPage(fetchPage);
      }
      callback(null, users);
    };
    return this.__queryUsers(qs, includeGroups, fetchPage);
  }

  return this.__queryUsers(qs, includeGroups, callback);
};

Waad.prototype.getGroupsForUserByEmail = function(email, callback) {
  this.getUserByEmail(email, true, function (err, user) {
    if (err) return callback(err);
    if (!user) return callback(null, null);
    return callback(null, user.groups);
  });
};

Waad.prototype.getGroupsForUserByProperty = function(propertyName, propertyValue, callback) {
  this.getUserByProperty(propertyName, propertyValue, true, function (err, user) {
    if (err) return callback(err);
    if (!user) return callback(null, null);
    return callback(null, user.groups);
  });
};



