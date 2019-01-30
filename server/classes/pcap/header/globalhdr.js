'use strict';

var util = require('util');
var _ = require('lodash');

var Packet = require('../packet');
var Constants = require('../constants');

/**
 * Global header packet for pcap file.
 * magic    --> Magic number
 * v_major  --> Major version number
 * v_minor  --> Minor version number
 * thiszone --> GMT to local correction
 * sigfigs  --> Accuracy of timestamps
 * snaplen  --> Max length of captured packets, in octets
 * linktype --> Data link type
 */
function GlobalHeader() {
  this._headers = [];
  this._headers.push(['magic', Constants.STRUCT_TYPES.UNSIGNED_LONG, Constants.TCPDUMP_MAGIC]);
  this._headers.push(['v_major', Constants.STRUCT_TYPES.UNSIGNED_SHORT, Constants.PCAP_VERSION_MAJOR]);
  this._headers.push(['v_minor', Constants.STRUCT_TYPES.UNSIGNED_SHORT, Constants.PCAP_VERSION_MINOR]);
  this._headers.push(['thiszone', Constants.STRUCT_TYPES.UNSIGNED_LONG, Constants.ZERO]);
  this._headers.push(['sigfigs', Constants.STRUCT_TYPES.UNSIGNED_LONG, Constants.ZERO]);
  this._headers.push(['snaplen', Constants.STRUCT_TYPES.UNSIGNED_LONG, Constants.DEFAULT_SNAPLEN]);
  this._headers.push(['linktype', Constants.STRUCT_TYPES.UNSIGNED_LONG, Constants.DEFAULT_LINKTYPE]);
  this.name = 'GlobalHeader';

  GlobalHeader.super_.apply(this, arguments);
}

util.inherits(GlobalHeader, Packet);

module.exports = GlobalHeader;
