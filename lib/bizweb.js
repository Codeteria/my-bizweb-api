/**
 * node-bizweb-api
 *
 * Copyright (c) 2016 Codeteria, contributors.
 * Licensed under the MIT license.
 * https://github.com/Codeteria/my-bizweb-api/blob/master/LICENSE-MIT
 */

var resources = {
  asset: require('./resources/asset'),
  assetLegacy: require('./resources/assetLegacy'),
  theme: require('./resources/theme')
};

function Bizweb(options) {
  if (!(this instanceof Bizweb)) {
    return new Bizweb(options);
  }

  options = options || {};

  this._api = {
    auth: options.auth || null,
    host: options.host || Bizweb.DEFAULT_HOST,
    port: options.port || Bizweb.DEFAULT_PORT,
    timeout: options.timeout || Bizweb.DEFAULT_TIMEOUT
  };

  this._initResources();
}

Bizweb.DEFAULT_HOST = null;
Bizweb.DEFAULT_PORT = 443;
Bizweb.DEFAULT_TIMEOUT = 120000;

Bizweb.prototype._initResources = function() {
  for (var name in resources) {
    this[name] = new resources[name](this);
  }
};

Bizweb.prototype._setApiField = function(key, value) {
  this._api[key] = value;
};

Bizweb.prototype.getApiField = function(key) {
  return this._api[key];
};

Bizweb.prototype.setAuth = function(key, passwd) {
  if (key && passwd) {
    this._setApiField('auth', key + ':' + passwd);
  }
};

Bizweb.prototype.setHost = function(host, port) {
  this._setApiField('host', host);
  if (port) {
    this.setPort(port);
  }
};

Bizweb.prototype.setPort = function(port) {
  this._setApiField('port', port);
};

Bizweb.prototype.setTimeout = function(timeout) {
  this._setApiField(
    'timeout',
    timeout === null ? Bizweb.DEFAULT_TIMEOUT : timeout
  );
};

module.exports = Bizweb;