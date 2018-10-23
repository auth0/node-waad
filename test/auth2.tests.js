var assert = require('assert')
  , auth = require('../lib/auth')
  , config = require('./config')
  , nock = require('nock');

describe('login to waad', function () {
  function assertParseError(actual, expected, token) {
    assert.deepEqual(actual, expected);
    assert.equal(token, null);
  }

  var message = 'Failed to parse response from graph API';
  var parseError = new Error(message);

  parseError.name = 'waad_parse_error';
  parseError.stack = 'Error stack'
  parseError.body = { error: 'body' };

  var tenantId = config.v1.TENANTID;
  var spnAppPrincipalId = config.v1.APPPRINCIPALID;
  var spnSymmetricKeyBase64 = config.v1.SYMMETRICKEY;
  var tenantDomain = config.v2.WAAD_TENANTDOMAIN;
  var clientId = config.v2.WAAD_CLIENTID;
  var clientSecret = config.v2.WAAD_CLIENTSECRET;

  describe('v1 fails to parse JSON response', function () {
    afterEach(function () {
      nock.cleanAll();
    });

    it('should return error details when it fails to parse the JSON response when getting an access token', function (done) {
      nock('https://accounts.accesscontrol.windows.net')
        .post('/tokens/OAuth/2')
        .replyWithError(parseError);

      auth.getAccessToken(tenantId, spnAppPrincipalId, spnSymmetricKeyBase64, function(err, token) {
        assertParseError(err, parseError, token);
        done();
      });
    });

    it('should return error details when it fails to parse the JSON response when getting an access token with client credentials', function (done) {
      nock('https://accounts.accesscontrol.windows.net')
        .post('/' + tenantId + '/tokens/OAuth/2')
        .replyWithError(parseError);

      auth.getAccessTokenWithClientCredentials(tenantId, spnAppPrincipalId, clientId, clientSecret, function(err, token) {
        assertParseError(err, parseError, token);
        done();
      });
    });
  });

  describe('v2 fails to parse JSON response', function () {
    beforeEach(function () {
      nock('https://login.windows.net')
        .post('/' + tenantDomain + '/oauth2/token')
        .replyWithError(parseError);
    });

    afterEach(function () {
      nock.cleanAll();
    });

    it('should return error details when it fails to parse the JSON response', function (done) {
      auth.getAccessTokenWithClientCredentials2(tenantDomain, clientId, clientSecret, function(err, token) {
        assertParseError(err, parseError, token);
        done();
      });
    });
  });
});
