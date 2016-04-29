/**
 * node-bizweb-api
 *
 * Copyright (c) 2016 Codeteria, contributors.
 * Licensed under the MIT license.
 * https://github.com/Codeteria/my-bizweb-api/blob/master/LICENSE-MIT
 */
 var util = require('./util');

 module.exports = function stripeMethod(spec) {
  var methodPath = util.makeInterpolator(spec.path || '');
  var requestMethod = (spec.method || 'GET').toUpperCase();
  var urlParams = spec.urlParams || [];

  return function() {
    var self = this;
    var args = [].slice.call(arguments);

    var callback = util.isFunction(args[args.length - 1]) && args.pop();
    var data = util.isObject(args[args.length - 1]) ? args.pop() : {};
    var urlData = this.createUrlData();

    var deferred = this.createDeferred(callback);

    for (var i = 0, l = urlParams.length; i < l; ++i) {
      var arg = args[0];
      if (urlParams[i] && !arg) {
        throw new Error('Bizweb: method requires argument "' + urlParams[i] + '", but got: ' + arg);
      }
      urlData[urlParams[i]] = args.shift();
    }

    var requestPath = this.createFullPath(methodPath, urlData);

    self._request(requestMethod, requestPath, data, function(err, response) {
      if (err) {
        deferred.reject(err);
      } else {
        deferred.resolve(response);
      }
    });

    return deferred.promise;
  };
};