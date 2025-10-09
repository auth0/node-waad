/**
 * Test to verify error handling preserves JSON error messages
 */

var assert = require('assert');
var GraphClient = require('../lib/waad');
var GraphClient10 = require('../lib/waad10');

describe('Error handling compatibility', function() {
  this.timeout(10000);

  /**
   * Helper function to validate error format
   */
  function validateErrorFormat(err, user, clientType) {
    assert.ok(err, 'Expected an error to be returned for ' + clientType);
    assert.equal(user, undefined, 'User should be undefined when error occurs for ' + clientType);

    // Error message should be a JSON string, not [object Object]
    assert.notEqual(err.message, '[object Object]',
      'Error message should not be [object Object] for ' + clientType);

    // Verify error message has meaningful content
    assert.ok(err.message.length > 0, 'Error message should not be empty for ' + clientType);

    return err;
  }

  it('should preserve JSON error message format for GraphClient10', function(done) {
    // Create a GraphClient10 with invalid credentials to trigger an error
    var client = new GraphClient10({
      tenant: 'test.onmicrosoft.com',
      accessToken: 'invalid-token'
    });

    client.getUserByUpn('test@test.com', function(err, user) {
      var validatedErr = validateErrorFormat(err, user, 'GraphClient10');

      // If it's a valid JSON error from Azure AD, verify it's properly formatted
      if (validatedErr.message.includes('odata.error')) {
        try {
          var parsedError = JSON.parse(validatedErr.message);
          assert.ok(parsedError['odata.error'], 'Error should contain odata.error structure');
        } catch (parseErr) {
          assert.fail('Error message should be valid JSON when containing odata.error');
        }
      }

      done();
    });
  });

  it('should preserve JSON error message format for GraphClient', function(done) {
    // Create a GraphClient with invalid credentials to trigger an error
    var client = new GraphClient({
      tenant: 'test.onmicrosoft.com',
      accessToken: 'invalid-token'
    });

    client.getUserByProperty('UserPrincipalName', 'test@test.com', function(err, user) {
      validateErrorFormat(err, user, 'GraphClient');
      done();
    });
  });
});
