/**
 * node-bizweb-api
 *
 * Copyright (c) 2016 Codeteria, contributors.
 * Licensed under the MIT license.
 * https://github.com/Codeteria/my-bizweb-api/blob/master/LICENSE-MIT
 */
 var util = require('./util');

 module.exports = _Error = function(raw) {
  this.populate.apply(this, arguments);
};

// Extend Native Error
_Error.prototype = Object.create(Error.prototype);

_Error.prototype.type = 'GenericError';
_Error.prototype.populate = function(type, message) {
  this.type = type;
  this.message = message;
};

_Error.extend = util.extend;

/**
 * Create subclass of internal Error klass
 */
var BizwebError = _Error.BizwebError = _Error.extend({
  type: 'BizwebError',
  populate: function(raw) {
    this.type = this.type;

    this.message = raw.message || 'Error Missing Message';
    this.detail = raw.detail || false;
    this.raw = raw;
  }
});

_Error.BizwebInvalidRequestError = BizwebError.extend({ type: 'BizwebInvalidRequestError' });
_Error.BizwebAPIError = BizwebError.extend({ type: 'BizwebAPIError' });
_Error.BizwebAuthenticationError = BizwebError.extend({ type: 'BizwebAuthenticationError' });
_Error.BizwebCallLimitError = BizwebError.extend({ type: 'BizwebCallLimitError' });
_Error.BizwebConnectionError = BizwebError.extend({ type: 'BizwebConnectionError' });