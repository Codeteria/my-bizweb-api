/**
 * node-bizweb-api
 *
 * Copyright (c) 2016 Codeteria, contributors.
 * Licensed under the MIT license.
 * https://github.com/Codeteria/my-bizweb-api/blob/master/LICENSE-MIT
 */

var https = require('https');
var path = require('path');

var when = require('when');

var SError = require('./error');
var util = require('./util');

function Resource(bizweb) {
  this._bizweb = bizweb;
  this.path = util.makeInterpolator(this.path);

  this.initialize.apply(this, arguments);
}

Resource.extend = util.extend;
Resource.method = require('./method');

Resource.prototype.path = '';

Resource.prototype.initialize = function() {};

Resource.prototype.createFullPath = function(methodPath, data) {
  return path.join(
    this.path(data),
    typeof methodPath === 'function' ?
      methodPath(data) : methodPath
  ).replace(/\\/g, '/');
};

Resource.prototype.createDeferred = function(callback) {
  var deferred = when.defer();

  if (callback) {
    deferred.promise.then(function(res) {
      setTimeout(function(){ callback(null, res); }, 0);
    }, function(err) {
      setTimeout(function(){ callback(err, null); }, 0);
    });
  }

  return deferred;
};

Resource.prototype.createUrlData = function() {
  return {};
};

Resource.prototype._errorHandler = function(req, callback) {
  var self = this;

  return function(err) {
    if (req._isAborted) {
      return;
    }

    callback.call(self, new SError.BizwebConnectionError({
      message: 'An error occurred with our connection to Bizweb',
      detail: err
    }), null);
  };
};

Resource.prototype._parseCallLimit = function(headers) {
  var parsed = null;
  var data = {
    called: 0,
    limit: 0
  };

  if (headers && typeof headers['X-Bizweb-Api-Call-Limit'] === 'string') {
    parsed = headers['X-Bizweb-Api-Call-Limit'].split('/');
  }

  if (Array.isArray(parsed) && parsed.length === 2) {
    data.called = parseInt(parsed[0], 10);
    data.limit = parseInt(parsed[1], 10);
  }

  return data;
};

Resource.prototype._responseHandler = function(req, callback) {
  var self = this;

  return function(res) {
    var response = '';

    res.setEncoding('utf8');

    res.on('data', function(chunk) {
      response += chunk;
    });

    res.on('end', function() {
      var err = null;
      var resp = null;

      if (res.statusCode === 401) {
        return callback.call(self, new SError.BizwebAuthenticationError({
          message: 'Authentication failed against the Bizweb API'
        }), null);
      } else if (res.statusCode === 404) {
        return callback.call(self, new SError.BizwebAPIError({
          message: 'Request failed with "HTTP 404 Not Found" from the Bizweb API'
        }), null);
      } else if (res.statusCode === 429) {
        return callback.call(self, new SError.BizwebCallLimitError({
          message: 'Request limit exceeded for the Bizweb API',
          detail: self._parseCallLimit(res.headers)
        }), null);
      }

      try {
        console.log("============> resp - " + response);
        resp = JSON.parse(response);

        if (resp.errors) {
          err = new SError.BizwebInvalidRequestError({
            message: 'Errors returned from the Bizweb API',
            detail: resp.errors
          });
        }
      } catch (e) {
        return callback.call(self, new SError.BizwebAPIError({
          message: 'Invalid JSON received from the Bizweb API',
          detail: e
        }), null);
      }

      callback.call(self, err, resp);
    });
  };
};

Resource.prototype._request = function(method, requestPath, data, callback) {
  var requestData = util.stringifyRequestData(data || {});
  var self = this;

  var headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(requestData)
  };

  function makeRequest() {
    console.log(requestPath);

    var timeout = self._bizweb.getApiField('timeout');

    var req = https.request({
      host: self._bizweb.getApiField('host'),
      port: self._bizweb.getApiField('port'),
      auth: self._bizweb.getApiField('auth'),
      path: requestPath,
      method: method,
      headers: headers
    });

    req.setTimeout(timeout, self._timeoutHandler(timeout, req, callback));
    req.on('response', self._responseHandler(req, callback));
    req.on('error', self._errorHandler(req, callback));

    req.write(requestData);
    req.end();
  }

  makeRequest();
};

Resource.prototype._timeoutHandler = function(timeout, req, callback) {
  var self = this;

  return function() {
    var timeoutErr = new Error('ETIMEDOUT');
    timeoutErr.code = 'ETIMEDOUT';

    req._isAborted = true;
    req.abort();

    callback.call(self, new SError.BizwebConnectionError({
      message: 'Request aborted due to timeout being reached (' + timeout + 'ms)',
      detail: timeoutErr
    }), null);
  };
};

module.exports = Resource;