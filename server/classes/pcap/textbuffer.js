/**
 * The Text writer.
 */
'use strict';

let _ = require('lodash');

let streamBuffers = require('stream-buffers');
/**
 * Initialize new pcap writer.
 * Also writes Global header in the file.
 * @param {String} file  Name of the file to be crated with file path.
 */
function TextBuffer() {
  this.buffer = new streamBuffers.WritableStreamBuffer({
    initialSize: (20 * 1024), // start at 100 kilobytes.
    incrementAmount: (3 * 1024), // grow by 10 kilobytes each time buffer overflows.
  });
}

/**
 * Write new packet in file
 * @param  {Buffer} pkt Buffer containing data.
 * @param  {Number} ts  Timestamp [optional].
 */
TextBuffer.prototype.writePacket = function(packet) {
  if (!packet.ts) { // if no timestamp is provided then default to current.
    packet.ts = (new Date()).getTime() * 1000;
  }

  // proto: UDP; datetime: 2019-01-23 14:59:33.531+0000; time: 1548255573.529784; hosts: 10.0.1.50:5080 ----> 10.9.5.7:5060 TOS:96 VLAN:0
  this.buffer.write(new Buffer(packet.ts + '  '+packet.sourceIp+':'+packet.sourcePort+' ---> '+packet.destinationIp + ':' + packet.destinationPort+'\r\n\r\n'));
  this.buffer.write(packet.data+'\r\n');
};

/**
 * Close the buffer and give back
 * @param  {Buffer} pkt Buffer containing data.
 * @param  {Number} ts  Timestamp [optional].
 */
TextBuffer.prototype.getPacketsAndClose = function() {
  this.buffer.end();
  return this.buffer.getContents();
};


module.exports = TextBuffer;
