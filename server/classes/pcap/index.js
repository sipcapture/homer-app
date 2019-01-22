/**
 * The Pcap writer.
 */
'use strict';

var _ = require('lodash');
var fs = require('fs');

var streamBuffers = require('stream-buffers');
var GlobalHeader = require('./header/globalhdr');
var PacketHeader = require('./header/packethdr');
var Constants = require('./constants');

/**
 * Initialize new pcap writer.
 * Also writes Global header in the file.
 * @param {String} file  Name of the file to be crated with file path.
 */
function PcapBuffer(snaplen, linktype) {
  this.buffer = new streamBuffers.WritableStreamBuffer({
        initialSize: (10 * 1024),   // start at 100 kilobytes.
        incrementAmount: (3 * 1024) // grow by 10 kilobytes each time buffer overflows.
  });
  
  var options = {};
  if (snaplen) { options.snaplen = snaplen; }
  if (linktype) { options.linktype = linktype; }
  // write global header.
  this.buffer.write(new Buffer((new GlobalHeader(options)).toString(), Constants.HEADER_ENCODING));
}

/**
 * Write new packet in file
 * @param  {Buffer} pkt Buffer containing data.
 * @param  {Number} ts  Timestamp [optional].
 */
PcapBuffer.prototype.writePacket = function(pkt, ts) {
  if (!ts) { // if no timestamp is provided then default to current.
    ts = (new Date()).getTime() * 1000;
  }
  var n = pkt.length;
  var ph = new PacketHeader({
    tv_sec: parseInt(parseInt(ts, Constants.INT_BASE) / Constants.M_SEC, Constants.INT_BASE),
    tv_usec: parseInt(((ts / Constants.M_SEC) - parseInt(ts/Constants.M_SEC, Constants.INT_BASE)) *
      Constants.M_SEC_F, Constants.INT_BASE),
    caplen: n,
    len: n
  });
  // write packet header
  this.buffer.write(new Buffer(ph.toString(), Constants.HEADER_ENCODING));
  // write packet data
  this.buffer.write(pkt);
};

/**
 * Write new packet in file
 * @param  {Buffer} pkt Buffer containing data.
 * @param  {Number} ts  Timestamp [optional].
 */
PcapBuffer.prototype.getPacketsAndClose = function() {
  this.buffer.end();
  return this.buffer.getContents();
};


/**
 * Close file stream.
 */
PcapBuffer.prototype.close = function() {
  return this.buffer.stop();
};

module.exports = PcapBuffer;
