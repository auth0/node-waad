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
     throw new Error('Must supply "tenant" id (16a88858-..2d0263900406) or domain (mycompany.onmicrosoft.com)');
  }

  if (!this.options.accessToken) {
    throw new Error('Must supply "accessToken"');
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


    var parsedBody;
    try {
      parsedBody = JSON.parse(body);
    } catch(e){
      var message = e.message || 'Failed to parse response from graph API';
      var parseError = new Error(message);

      parseError.name = e.name || 'waad_parse_error';
      parseError.stack = e.stack;
      parseError.body = body;
      return callback(parseError);
    }

    var groups = parsedBody.d.results;
    return callback(null, groups);
  });
};

Waad.prototype.__queryUsers = function (qs, options, callback) {
  if (typeof(options) === 'function') {
    callback = options;
    options = options || {};
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

    var parsedBody;
    try {
      parsedBody = JSON.parse(body);
    } catch (e){
      var message = e.message || 'Failed to parse response from graph API';
      var parseError = new Error(message);

      parseError.name = e.name || 'waad_parse_error';
      parseError.stack = e.stack;
      parseError.body = body;
      return callback(parseError);
    }

    var d = parsedBody.d,
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
          this.__queryUsers(newQs, options, callback);
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

    if (!options || !options.includeGroups)
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

Waad.prototype.getUserByEmail = function (email, options, callback) {
  if (typeof(includeGroups) === 'function') {
    callback = includeGroups;
    options = {};
  }

  var qs = {
    "$filter": "Mail eq '" + email + "'",
    "$top" : 1
  };
  return this.__queryUsers(qs, options, function (err, users) {
    if(err) return callback(err);
    return callback(null, users[0]);
  });
};

Waad.prototype.getUserByProperty = function (propertyName, propertyValue, options, callback) {
	if (typeof(options) === 'function') {
		callback = options;
    options = {};
	}

	var qs = {
		"$filter": propertyName + " eq '" + propertyValue + "'",
		"$top" : 1
	};
	return this.__queryUsers(qs, options, function (err, users) {
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

Waad.prototype.getGroupsForUserByEmail = function(email, includeNested, callback) {
  if (typeof(includeNested) === 'function') {
    callback = includeNested;
    includeNested = false;
  }

  this.getUserByEmail(email, { includeGroups: true, includeNestedGroups: includeNested}, function (err, user) {
    if (err) return callback(err);
    if (!user) return callback(null, null);
    return callback(null, user.groups);
  });
};

Waad.prototype.getGroupsForUserByProperty = function(propertyName, propertyValue, callback) {
  this.getUserByProperty(propertyName, propertyValue, { includeGroups: true}, function (err, user) {
    if (err) return callback(err);
    if (!user) return callback(null, null);
    return callback(null, user.groups);
  });
};
