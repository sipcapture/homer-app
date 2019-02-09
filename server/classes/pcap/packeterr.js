'use strict';

/**
 * New packet error, extends default error class.
 */
function PacketError(message, extra) {
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, this.constructor);
  }
  this.name = this.constructor.name;
  this.level = 'Critical';
  this.message = message;
  this.extra = extra;
}
// inherit from error;
require('util').inherits(PacketError, Error);

module.exports = PacketError;
