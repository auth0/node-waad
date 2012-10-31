var util = require('util')

var AbstractError = function (msg, constr) {
  Error.captureStackTrace(this, constr || this);
  this.message = msg || 'Error';
}

util.inherits(AbstractError, Error);
AbstractError.prototype.name = 'Abstract Error';

var OAuthError = function (msg, details) {
  OAuthError.super_.call(this, msg, this.constructor);
  this.details = details;
}

util.inherits(OAuthError, AbstractError);
OAuthError.prototype.name = 'OAuth Error';

module.exports.AbstractError = AbstractError;
module.exports.OAuthError = OAuthError;
