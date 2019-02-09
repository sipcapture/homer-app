'use strict';

let util = require('util');
let Packet = require('../packet');
let Constants = require('../constants');

/**
 * Packet header class.
 * tv_sec  --> Timestamp in seconds.
 * tv_usec --> Timestamp in miliseconds.
 * caplen  --> Number of octets of packet saved in file.
 * len     --> Actual length of packet.
 */
function PacketHeader() {
  this._headers = [];
  this._headers.push(['tv_sec', Constants.STRUCT_TYPES.UNSIGNED_LONG, Constants.ZERO]);
  this._headers.push(['tv_usec', Constants.STRUCT_TYPES.UNSIGNED_LONG, Constants.ZERO]);
  this._headers.push(['caplen', Constants.STRUCT_TYPES.UNSIGNED_LONG, Constants.ZERO]);
  this._headers.push(['len', Constants.STRUCT_TYPES.UNSIGNED_LONG, Constants.ZERO]);
  this.name = 'PacketHeader';
  
  PacketHeader.super_.apply(this, arguments);
}

util.inherits(PacketHeader, Packet);

module.exports = PacketHeader;
