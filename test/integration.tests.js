/**
 * Integration test to verify the auth module works with our new HTTP client
 */

var assert = require('assert');
var auth = require('../lib/auth');

describe('Auth module integration', function() {
  this.timeout(5000);

  it('should export required methods', function() {
    assert.equal(typeof auth.getAccessToken, 'function');
    assert.equal(typeof auth.getGraphClient, 'function');
    assert.equal(typeof auth.getAccessTokenWithClientCredentials2, 'function');
    assert.equal(typeof auth.getGraphClient10, 'function');
  });

  it('should handle invalid credentials gracefully', function(done) {
    // Test with obviously invalid credentials
    auth.getAccessToken('invalid-tenant', 'invalid-principal', 'invalid-key', function(err, token) {
      // Should get an error, not crash
      assert.ok(err);
      assert.equal(token, null);
      done();
    });
  });
});
