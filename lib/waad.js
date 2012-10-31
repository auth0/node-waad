var request = require('request');

var waad = module.exports = {};

waad.getUserByEmail = function(access_token, email, callback) {
	//https://directory.windows.net/16a88858-4384-44f0-9629-2d0263900406/Users()?$filter=Mail%20eq%20'themeail@blah.com'&$top=1
	var qs = {
		"$filter": "Mail eq '" + email + "'",
		"$top" : 1
	};

	var headers = {
			'Authorization': 'Bearer ' + access_token,
			'Accept': 'application/json;odata=verbose;charset=utf-8',
			'x-ms-dirapi-data-contract-version': '0.5'
	};

	request({url: 'https://directory.windows.net/16a88858-4384-44f0-9629-2d0263900406/Users()', qs: qs, headers: headers}, 
			function(err, resp, body) {
				if (err) return callback(err, null);
						
				if (resp.statusCode != 200) {
					return callback(new Error(body), null)
				}

				var first = JSON.parse(body).d.results[0];
				callback(null, first);
			});
}

waad.getGroupsForUserByEmail = function(access_token, email, callback) {
	waad.getUserByEmail(access_token, email, function(err, user) {
		if (err) return callback(err, null);

		var headers = {
				'Authorization': 'Bearer ' + access_token,
				'Accept': 'application/json;odata=verbose;charset=utf-8',
				'x-ms-dirapi-data-contract-version': '0.5'
		};

		request({url: user.MemberOf.__deferred.uri, headers: headers}, 
				function(err, resp, body) {
					if (err) return callback(err, null);
							
					if (resp.statusCode != 200) {
						return callback(new Error(body), null)
					}

					var groups = JSON.parse(body).d.results;
					callback(null, groups);
				});
	});
}



