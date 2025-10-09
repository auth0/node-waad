/**
 * HTTP client wrapper around native fetch API
 * Maintains compatibility with the legacy request library API
 */

/**
 * Make an HTTP request using fetch with request-like callback interface
 * @param {Object|string} options - Request options or URL string
 * @param {Function} callback - Callback function (err, response, body)
 */
function request(options, callback) {
  // Handle string URL parameter
  if (typeof options === 'string') {
    options = { url: options };
  }

  const {
    url,
    method = 'GET',
    headers = {},
    qs = {},
    json,
    form,
    body
  } = options;

  // Build URL with query parameters
  let requestUrl;
  try {
    requestUrl = new URL(url);
  } catch (error) {
    // Handle invalid URLs
    return callback(error, null, null);
  }

  Object.entries(qs).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      requestUrl.searchParams.set(key, value);
    }
  });

  // Prepare request options
  const fetchOptions = {
    method: method.toUpperCase(),
    headers: { ...headers }
  };

  // Handle different body types
  if (json && typeof json === 'object') {
    // JSON request body
    fetchOptions.headers['Content-Type'] = 'application/json';
    fetchOptions.body = JSON.stringify(json);
  } else if (form && typeof form === 'object') {
    // Form-encoded request body
    fetchOptions.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    fetchOptions.body = new URLSearchParams(form).toString();
  } else if (body) {
    // Raw body
    fetchOptions.body = body;
  }

  // Make the request
  fetch(requestUrl.toString(), fetchOptions)
    .then(response => {
      // Create response object similar to request library
      const responseObj = {
        statusCode: response.status,
        statusMessage: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      };

      // Get response body
      return response.text().then(bodyText => {
        // Try to parse JSON if response indicates JSON content
        let parsedBody = bodyText;
        const contentType = response.headers.get('content-type') || '';

        if (contentType.includes('application/json') && bodyText) {
          try {
            parsedBody = JSON.parse(bodyText);
          } catch (e) {
            // Keep as text if JSON parsing fails
          }
        }

        // Call callback with (error, response, body) signature
        callback(null, responseObj, parsedBody);
      }).catch(parseError => {
        // Handle response parsing errors
        callback(parseError, null, null);
      });
    })
    .catch(error => {
      // Network or other fetch errors
      callback(error, null, null);
    });
}

/**
 * Convenience method for POST requests
 */
request.post = function(url, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  const requestOptions = {
    ...options,
    url: url,
    method: 'POST'
  };

  return request(requestOptions, callback);
};

/**
 * Create a new request function with default options
 */
request.defaults = function(defaultOptions) {
  return function(options, callback) {
    if (typeof options === 'string') {
      options = { url: options };
    }

    const mergedOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers
      }
    };

    return request(mergedOptions, callback);
  };
};

module.exports = request;
