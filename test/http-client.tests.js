/**
 * Test the HTTP client functionality with nock v14 fetch support
 */

var assert = require('assert');
var httpClient = require('../lib/http-client');
var nock = require('nock');

describe('HTTP Client (fetch wrapper)', function() {
  this.timeout(5000);

  beforeEach(function() {
    nock.cleanAll();
  });

  afterEach(function() {
    nock.cleanAll();
  });

  it('should be a function', function() {
    assert.equal(typeof httpClient, 'function');
  });

  it('should have post method', function() {
    assert.equal(typeof httpClient.post, 'function');
  });

  it('should have defaults method', function() {
    assert.equal(typeof httpClient.defaults, 'function');
  });

  it('should handle invalid URL gracefully', function(done) {
    httpClient('invalid-url', function(err, response, body) {
      assert.ok(err);
      assert.equal(response, null);
      assert.equal(body, null);
      done();
    });
  });

  it('should make a GET request', function(done) {
    const scope = nock('https://api.example.com')
      .get('/test')
      .reply(200, { message: 'success' });

    httpClient('https://api.example.com/test', function(err, response, body) {
      if (err) return done(err);

      assert.equal(response.statusCode, 200);
      assert.ok(body);
      assert.equal(body.message, 'success');
      scope.done();
      done();
    });
  });

  it('should make a POST request with form data', function(done) {
    const scope = nock('https://api.example.com')
      .post('/test')
      .reply(200, { received: 'ok' });

    const options = {
      url: 'https://api.example.com/test',
      form: {
        key1: 'value1',
        key2: 'value2'
      }
    };

    httpClient.post(options.url, options, function(err, response, body) {
      if (err) return done(err);

      assert.equal(response.statusCode, 200);
      assert.ok(body);
      scope.done();
      done();
    });
  });

  it('should make a POST request with JSON data', function(done) {
    const scope = nock('https://api.example.com')
      .post('/test')
      .reply(200, { received: 'ok' });

    const options = {
      url: 'https://api.example.com/test',
      json: {
        test: 'data',
        number: 123
      }
    };

    httpClient.post(options.url, options, function(err, response, body) {
      if (err) return done(err);

      assert.equal(response.statusCode, 200);
      assert.ok(body);
      scope.done();
      done();
    });
  });

  it('should handle query parameters', function(done) {
    const scope = nock('https://api.example.com')
      .get('/test')
      .query({ param1: 'value1', param2: 'value2' })
      .reply(200, { query_received: 'ok' });

    const options = {
      url: 'https://api.example.com/test',
      qs: {
        param1: 'value1',
        param2: 'value2'
      }
    };

    httpClient(options, function(err, response, body) {
      if (err) return done(err);

      assert.equal(response.statusCode, 200);
      assert.equal(body.query_received, 'ok');
      scope.done();
      done();
    });
  });

  it('should handle custom headers', function(done) {
    const scope = nock('https://api.example.com', {
      reqheaders: {
        'x-custom-header': 'test-value',
        'authorization': 'Bearer test-token'
      }
    })
      .get('/test')
      .reply(200, { headers_received: 'ok' });

    const options = {
      url: 'https://api.example.com/test',
      headers: {
        'X-Custom-Header': 'test-value',
        'Authorization': 'Bearer test-token'
      }
    };

    httpClient(options, function(err, response, body) {
      if (err) return done(err);

      assert.equal(response.statusCode, 200);
      assert.equal(body.headers_received, 'ok');
      scope.done();
      done();
    });
  });

  it('should handle HTTP error status codes', function(done) {
    const scope = nock('https://api.example.com')
      .get('/error')
      .reply(404, { error: 'Not found' });

    httpClient('https://api.example.com/error', function(err, response, body) {
      // Should not return an error for HTTP status codes
      assert.equal(err, null);
      assert.equal(response.statusCode, 404);
      assert.equal(body.error, 'Not found');
      scope.done();
      done();
    });
  });
});
