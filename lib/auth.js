var request = require('request')
  , jwt = require('jwt-simple')
  , moment = require('moment')
  , OAuthError = require('./errors').OAuthError;

var authenticator = module.exports = {};

authenticator.auth = function(tenantId, spnAppPrincipalId, spnSymmetricKeyBase64, callback) {
	var payload = {
	    "aud": "00000001-0000-0000-c000-000000000000/accounts.accesscontrol.windows.net@" + tenantId,
	    "iss": spnAppPrincipalId + "@" + tenantId,
	    "nbf": moment().unix(),
	    "exp": moment().add('hours', 1).unix()
	};

	var key = new Buffer(spnSymmetricKeyBase64, 'base64').toString('binary')
	var token = jwt.encode(payload, key);
	var data = { 
				grant_type: 'http://oauth.net/grant_type/jwt/1.0/bearer',
				assertion: token,
				resource: '00000002-0000-0000-c000-000000000000/directory.windows.net@' + tenantId
			   };

	request.post('https://accounts.accesscontrol.windows.net/tokens/OAuth/2', { form: data }, function(e, resp, body) {
		if (e) return callback(e, null);
		
		if (resp.statusCode != 200) {
			try {
				var response = JSON.parse(body);
				if (response.error) {
					return callback(new OAuthError(response.error_description || response.error, response), null)
				}
			}
			catch (e) {}

			return callback(new OAuthError(body), null)
		}

		callback(null, JSON.parse(body).access_token)
	});
}



