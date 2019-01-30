'use strict';

let _ = require('lodash');
let struct = require('bufferpack');
let os = require('os');

let PacketError = require('./packeterr');
let Constants = require('./constants');

// Packet class.
function Packet(options) {
  this.options = options;
  this.setup();
}

/**
 * Setup packet instance.
 * @param {Buffer} buf Optional packet buffer to unpack.
 */
Packet.prototype.setup = function() {
  this.data = '';
  this.setFormat();
  this.setFields();
  this.setDefaults();
  this._hdrLen = struct.calcLength(this._hdrFmt); // calculate packet length
  if (arguments && arguments[0]) {
    this.unpack(arguments[0]);
  } else {
    this.populatePacket();
  }
  this.setValuesFromOpts();
};

// override self values that are passed as options.
Packet.prototype.setValuesFromOpts = function() {
  let self = this;
  if (self.options) {
    _.forOwn(self.options, function(val, key) {
      self[key] = val;
    });
  }
};

// set header format based on byte order of system.
Packet.prototype.setFormat = function() {
  this._hdrFmt = Constants.BYTE_ORDER[os.endianness()];
  let self = this;
  _.forEach(this._headers, function(h) {
    self._hdrFmt += h[1] + '';
  });
};

// set header fileds.
Packet.prototype.setFields = function() {
  let self = this;
  self._hdrFields = [];
  _.forEach(this._headers, function(h) {
    self._hdrFields.push(h[0]);
  });
};

// set default values.
Packet.prototype.setDefaults = function() {
  let self = this;
  self._hdrDefaults = {};
  _.forEach(this._headers, function(h) {
    self._hdrDefaults[h[0]] = h[2];
  });
};

/**
 * Unpack packet header fields from buf, and set self.data.
 */
Packet.prototype.unpack = function(buf) {
  let self = this;
  try {
    let up = struct.unpack(this._hdrFmt, buf.slice(0, this._hdrLen));
    _.forEach(self._hdrFields, function(h, i) {
      self[h] = up[i];
    });
    self.data = buf.slice(self._hdrLen);
  } catch (e) { // if error in struct unpack
    if (buf.length < self._hdrLen) {
      throw new PacketError('Need more data');
    }
    throw new PacketError(e.toString());
  }
};

/**
 * Populate packet with values.
 */
Packet.prototype.populatePacket = function() {
  let self = this;
  _.forEach(self._hdrFields, function(h, i) {
    self[h] = self._hdrDefaults[h];
  });
};

/**
 * Get total length of packet.
 * @return {Number} _Headers + data length.
 */
Packet.prototype.len = function() {
  return this._hdrLen + this.data.length;
};

/**
 * Collect and display protocol fields in order:
 */
Packet.prototype.print = function() {
  let self = this;
  let collector = [];
  _.forEach(this._hdrFields, function(fieldName) {
    let fieldValue = self[fieldName];
    // add public fields defined in _hdrFields, unless their value is default
    if (fieldValue !== self._hdrDefaults[fieldName]) {
      if (fieldValue[0] !== '_') {
        collector.push(fieldName + '=' + fieldValue);
      } else {
        // properties derived from _private fields defined in _hdrFields
        // interpret private fields as name of properties joined by underscores
        _.forEach(fieldValue.split('_'), function(propName) {
          let val = self[propName];
          if (_.isObject(val)) {
            if (!_.isArray(val)) {
              collector.push(propName + '=' + val);
            } else {
              _.forEach(val, function(arrValue, index) {
                collector.push(propName + '[' + index + ']=' + arrValue);
              });
            }
          } else {
            collector.push(propName + '=' + val);
          }
        });
      }
    }
  });
  // dynamically added fields from self._dict, unless they are _private
  if (self._dict) {
    _.forOwn(self._dict, function(attrValue, attrName) {
      if (attrName[0] !== '_') { // exclude _private attributes
        collector.push(attrName + '=' + attrValue);
      }
    });
  }
  // self.data when it's present
  if (self.data) {
    collector.push('data=' + self.data);
  }
  return self.name + '(' + collector.join(', ') + ')';
};

/**
 * Overriding default toString to provide custom string represenatation of packet.
 * Returns packed header + self.data string.
 * @return {String} Packed _headers and data as string.
 */
Packet.prototype.toString = function() {
  return this.pack() + this.data.toString();
};

/**
 * Return packed header string.
 */
Packet.prototype.pack = function() {
  let dp = [], self = this;
  _.forEach(this._hdrFields, function(hf) {
    dp.push(self[hf]);
  });
  try {
    return struct.pack(this._hdrFmt, dp).toString(Constants.HEADER_ENCODING);
  } catch (e) { // first error, do fallback mechanism.
    let vals = [];
    _.forEach(self._hdrFields, function(hf) {
      let val = self[hf];
      if (_.isArray(val)) {
        vals = _.extend(vals, val);
      } else {
        vals.push(val);
      }
    });
    try {
      return struct.pack(this._hdrFmt, vals).toString(Constants.HEADER_ENCODING);
    } catch (se) { // second error, throw error to user this time.
      throw new PacketError(se.toString());
    }
  }
};

module.exports = Packet;
