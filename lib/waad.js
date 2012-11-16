var request = require('request');

exports = module.exports = waad;

function waad(options) {
	options = options || {};
	this.options = options;

	if (this.options.fiddler) {
		request = request.defaults({'proxy':'http://127.0.0.1:8888'});
	}
}

waad.prototype.getUserByEmail = function(access_token, tenant, email, include_groups, callback) {
	
	var _include_groups = false;
	
	if (typeof(include_groups) === 'function') {
		callback = include_groups;
	} else {
		_include_groups = include_groups;
	}
	
	//https://directory.windows.net/16a88858-4384-44f0-9629-2d0263900406/Users()?$filter=Mail%20eq%20'themeail@blah.com'&$top=1
	if (!tenant) {
		return callback(new Error('Must supply "tenant" id (16a88858-..2d0263900406) or domain (mycompany.onmicrosoft.com)'), null);
	}

	var qs = {
		"$filter": "Mail eq '" + email + "'",
		"$top" : 1
	};

	var headers = {
			'Authorization': 'Bearer ' + access_token,
			'Accept': 'application/json;odata=verbose;charset=utf-8',
			'x-ms-dirapi-data-contract-version': '0.5'
	};

	request({url: 'https://directory.windows.net/'+ tenant + '/Users()', qs: qs, headers: headers},
			function(err, resp, body) {
				if (err) return callback(err, null);
						
				if (resp.statusCode != 200) {
					return callback(new Error(body), null);
				}

				var user = JSON.parse(body).d.results[0];
				if (!user)
					return callback(null, null);

				if (!_include_groups)
					return callback(null, user);

				request({url: user.MemberOf.__deferred.uri, headers: headers},
					function(err, resp, body) {
						if (err) return callback(err, null);
								
						if (resp.statusCode != 200) {
							return callback(new Error(body), null);
						}

						var groups = JSON.parse(body).d.results;
						user.groups = groups;
						callback(null, user);
					});
			});
};

waad.prototype.getGroupsForUserByEmail = function(access_token, tenant, email, callback) {
	if (!tenant) {
		return callback(new Error('Must supply "tenant" id (16a88858-..2d0263900406) or domain (mycompany.onmicrosoft.com)'), null);
	}

	this.getUserByEmail(access_token, tenant, email, function(err, user) {
		if (err) return callback(err, null);

		if (!user)
			return callback(null, null);

		var headers = {
				'Authorization': 'Bearer ' + access_token,
				'Accept': 'application/json;odata=verbose;charset=utf-8',
				'x-ms-dirapi-data-contract-version': '0.5'
		};

		request({url: user.MemberOf.__deferred.uri, headers: headers},
				function(err, resp, body) {
					if (err) return callback(err, null);
							
					if (resp.statusCode != 200) {
						return callback(new Error(body), null);
					}

					var groups = JSON.parse(body).d.results;
					callback(null, groups);
				});
	});
};



