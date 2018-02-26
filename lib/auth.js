var request = require('request')
  , jwt = require('jwt-simple')
  , moment = require('moment')
  , OAuthError = require('./errors').OAuthError
  , GraphClient = require('./waad')
  , GraphClient10 = require('./waad10');

var authenticator = module.exports = {};

authenticator.getAccessToken = function(tenantId, spnAppPrincipalId, spnSymmetricKeyBase64, callback) {
  var payload = {
      "aud": "00000001-0000-0000-c000-000000000000/accounts.accesscontrol.windows.net@" + tenantId,
      "iss": spnAppPrincipalId + "@" + tenantId,
      "nbf": moment().unix(),
      "exp": moment().add(1, 'hours').unix()
  };

  var key = new Buffer(spnSymmetricKeyBase64, 'base64');
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
          return callback(new OAuthError(response.error_description || response.error, response), null);
        }
      }
      catch(err) {}

      return callback(new OAuthError(body), null);
    }

    callback(null, JSON.parse(body).access_token);
  });
};

authenticator.getGraphClient = function (tenantId, spnAppPrincipalId, spnSymmetricKeyBase64, callback) {
  authenticator.getAccessToken(tenantId, spnAppPrincipalId, spnSymmetricKeyBase64, function (err, token) {
    if (err) return callback(err);
    callback(null, new GraphClient({tenant: tenantId, accessToken: token}));
  });
};

authenticator.getAccessTokenWithClientCredentials = function(tenantDomain, appDomain, clientId, clientSecret, callback) {
  var data = {
        grant_type: 'client_credentials',
        client_id: clientId + '/' + appDomain + '@' + tenantDomain,
        client_secret: clientSecret,
        resource: '00000002-0000-0000-c000-000000000000/graph.windows.net@' + tenantDomain
         };

  request.post('https://accounts.accesscontrol.windows.net/' + tenantDomain + '/tokens/OAuth/2', { form: data }, function(e, resp, body) {
    if (e) return callback(e, null);

    if (resp.statusCode != 200) {
      try {
        var response = JSON.parse(body);
        if (response.error) {
          return callback(new OAuthError(response.error_description || response.error, response), null);
        }
      }
      catch (exp) {}

      return callback(new OAuthError(body), null);
    }

    callback(null, JSON.parse(body).access_token);
  });
};

authenticator.getAccessTokenWithClientCredentials2 = function(tenantDomain, clientId, clientSecret, callback) {
  var data = {
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
    resource: '00000002-0000-0000-c000-000000000000/graph.windows.net@' + tenantDomain
  };

  request.post('https://login.windows.net/' + tenantDomain + '/oauth2/token', { form: data }, function(e, resp, body) {
    if (e) return callback(e, null);

    if (resp.statusCode != 200) {
      try {
        var response = JSON.parse(body);
        if (response.error) {
          return callback(new OAuthError(response.error_description || response.error, response), null);
        }
      }
      catch (exp) {}

      return callback(new OAuthError(body), null);
    }

    callback(null, JSON.parse(body).access_token);
  });
};

authenticator.getGraphClientWithClientCredentials = function(tenantDomain, appDomain, clientId, clientSecret, callback) {
  authenticator.getAccessTokenWithClientCredentials(tenantDomain, appDomain, clientId, clientSecret, function (err, token) {
    if(err) return callback (err);
    return callback(null, new GraphClient({tenant: tenantDomain, accessToken: token}));
  });
};

authenticator.getGraphClientWithClientCredentials2 = function(tenantDomain, clientId, clientSecret, callback) {
  authenticator.getAccessTokenWithClientCredentials2(tenantDomain, clientId, clientSecret, function (err, token) {
    if(err) return callback (err);
    return callback(null, new GraphClient({tenant: tenantDomain, accessToken: token}));
  });
};

authenticator.getGraphClient10 = function(tenantDomain, clientId, clientSecret, callback) {
  authenticator.getAccessTokenWithClientCredentials2(tenantDomain, clientId, clientSecret, function (err, token) {
    if(err) return callback (err);
    return callback(null, new GraphClient10({tenant: tenantDomain, accessToken: token}));
  });
};


