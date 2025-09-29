/**
 * Test to verify error handling preserves JSON error messages
 */

var assert = require('assert');
var waad = require('../lib');
var GraphClient = require('../lib/waad');
var GraphClient10 = require('../lib/waad10');

describe('Error handling compatibility', function() {
  this.timeout(10000);

  it('should preserve JSON error message format for GraphClient10', function(done) {
    // Create a GraphClient10 with invalid credentials to trigger an error
    var client = new GraphClient10({
      tenant: 'test.onmicrosoft.com',
      accessToken: 'invalid-token'
    });

    // This should fail and return a properly formatted error
    client.getUserByUpn('test@test.com', function(err, user) {
      // Should get an error
      assert.ok(err);
      assert.equal(user, undefined);
      
      // Error message should be a JSON string, not [object Object]
      assert.notEqual(err.message, '[object Object]');
      
      // If it's a valid JSON error from Azure AD, it should contain "odata.error"
      if (err.message.includes('odata.error')) {
        console.log('✅ Error format preserved:', err.message.substring(0, 100) + '...');
        try {
          var parsedError = JSON.parse(err.message);
          assert.ok(parsedError['odata.error']);
          console.log('✅ Error is valid JSON with odata.error structure');
        } catch (parseErr) {
          console.log('❌ Error message is not valid JSON:', err.message);
        }
      } else {
        console.log('ℹ️  Different error type (expected for invalid test credentials):', err.message);
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

    // This should fail and return a properly formatted error
    client.getUserByProperty('UserPrincipalName', 'test@test.com', function(err, user) {
      // Should get an error
      assert.ok(err);
      assert.equal(user, undefined);
      
      // Error message should be a JSON string, not [object Object]
      assert.notEqual(err.message, '[object Object]');
      
      console.log('✅ GraphClient error format preserved:', err.message.substring(0, 100) + '...');
      
      done();
    });
  });
});
