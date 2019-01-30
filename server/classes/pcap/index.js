/**
 * The Pcap writer.
 */
'use strict';

let _ = require('lodash');
let fs = require('fs');
let ip = require('ip');

let streamBuffers = require('stream-buffers');
let GlobalHeader = require('./header/globalhdr');
let PacketHeader = require('./header/packethdr');
let Constants = require('./constants');

/**
 * Initialize new pcap writer.
 * Also writes Global header in the file.
 * @param {String} file  Name of the file to be crated with file path.
 */
function PcapBuffer(snaplen, linktype) {
  this.buffer = new streamBuffers.WritableStreamBuffer({
    initialSize: (10 * 1024), // start at 100 kilobytes.
    incrementAmount: (3 * 1024), // grow by 10 kilobytes each time buffer overflows.
  });
  
  let options = {};
  if (snaplen) {
options.snaplen = snaplen;
}
  if (linktype) {
options.linktype = linktype;
}
  // write global header.
  this.buffer.write(new Buffer((new GlobalHeader(options)).toString(), Constants.HEADER_ENCODING));
}

/**
 * Write new packet in file
 * @param  {Buffer} pkt Buffer containing data.
 * @param  {Number} ts  Timestamp [optional].
 */
PcapBuffer.prototype.writePacket = function(packet) {
  if (!packet.ts) { // if no timestamp is provided then default to current.
    packet.ts = (new Date()).getTime() * 1000;
  }

  let ethernetBuffer = new Buffer([
    // ETHERNET
    0x01, 0x01, 0x01, 0x01, 0x01, 0x01, // 0    = Destination MAC
    0x02, 0x02, 0x02, 0x02, 0x02, 0x02, // 6    = Source MAC
    0x08, 0x00, // 12   = EtherType = IPv4
  ]);

  let ipBuffer = new Buffer([
    0x45, // IP: Version (0x45 is IPv4)
    0x00, // IP: Differentiated Services Field
    0x00, 0x2c, // IP: Total Length
    0x00, 0x00, // IP: Identification
    0x00, // IP: Flags (0x20 Don't Fragment)
    0x00, // IP: Fragment Offset
    0x80, // IP: TTL (0x80 is 124)
    0x11, // IP: protocol (ICMP=1, IGMP=2, TCP=6, UDP=17, static value)
    0x0a, 0x15, // IP: checksum for IP part of this packet
    0x00, 0x00, 0x00, 0x00, // IP: ip src
    0x00, 0x00, 0x00, 0x00, // IP: ip dst
  ]);


  ipBuffer.writeUInt16BE(parseInt(Math.random()*0xffff), 4); // IP: set identification
  ip.toBuffer(packet.sourceIp, ipBuffer, 12); // IP: save ip src (src_ip var) into the buffer
  ip.toBuffer(packet.destinationIp, ipBuffer, 16); // IP: save ip dst (dst_ip var) into the buffer
  

  /*
  var tcpBuffer = new Buffer([
        0x00,0x00,              // TCP: src port (should be random)
        0x00,0x00,              // TCP: dst port (should be the port you want to scan)
        0x00,0x00,0x00,0x00,    // TCP: sequence number (should be random)
        0x00,0x00,0x00,0x00,    // TCP: acquitment number (must be null because WE are intiating the SYN, static value)
        0x00,0x02,              // TCP: header length (data offset) && flags (fin=1,syn=2,rst=4,psh=8,ack=16,urg=32, static value)
        0x72,0x10,              // TCP: window
        0x00,0x00,              // TCP: checksum for TCP part of this packet)
        0x00,0x00,              // TCP: ptr urgent
        0x02,0x04,              // TCP: options
        0x05,0xb4,              // TCP: padding (mss=1460, static value)
        0x04,0x02,              // TCP: SACK Permitted (4) Option
        0x08,0x0a,              // TCP: TSval, Length
            0x01,0x75,0xdd,0xe8,// value
            0x00,0x00,0x00,0x00,// TSecr
        0x01,                   // TCP: NOP
        0x03,0x03,0x07          // TCP: Window scale
    ]);

   tcpBuffer.writeUInt32BE(parseInt(Math.random()*0xffffffff), 4); // TCP: create random sequence number
   tcpBuffer.writeUInt8(tcpBuffer.length << 2, 12); // TCP: write Header Length
   tcpBuffer.writeUInt16BE(src_port, 0); // TCP: save src port (src_port var) into the buffer
   tcpBuffer.writeUInt16BE(dst_port, 2); // TCP: save dst port (port var) into the buffer
   */
   
  /* DO UDP HERE */
   
  let udpBuffer = new Buffer(8);
  udpBuffer.writeUInt16BE(packet.sourcePort, 0);
  udpBuffer.writeUInt16BE(packet.destinationPort, 2);
  udpBuffer.writeUInt16BE((udpBuffer.length+packet.data.length), 4);

  // udpBuffer.writeUInt16BE(checkSum(packet), 6)
  ipBuffer.writeUInt16BE(udpBuffer.length+ipBuffer.length+packet.data.length, 2); // IP: set identification

  let n = packet.data.length + ethernetBuffer.length + ipBuffer.length + udpBuffer.length;
  let ph = new PacketHeader({
   	tv_sec: parseInt(parseInt(packet.ts, Constants.INT_BASE) / Constants.M_SEC, Constants.INT_BASE),
    tv_usec: parseInt(((packet.ts / Constants.M_SEC) - parseInt(packet.ts/Constants.M_SEC, Constants.INT_BASE)) *
	Constants.M_SEC_F, Constants.INT_BASE),
    caplen: n,
    len: n,
  });
  // write packet header
  this.buffer.write(new Buffer(ph.toString(), Constants.HEADER_ENCODING));
  // write ethernetBuffer data
  this.buffer.write(ethernetBuffer);
  // write ipBuffer data
  this.buffer.write(ipBuffer);
  // write tcpBuffer data
  this.buffer.write(udpBuffer);
  // write packet data
  this.buffer.write(packet.data);
};


PcapBuffer.checkSum = function(packet) {
  // pseudo header: srcip (16), dstip (16), 0 (8), proto (8), udp len (16)
  let data = packet.data, len = data.length;
  let srcport = packet.sourcePort, srcip = packet.sourceIp;
  let dstport = packet.destinationPort, dstip = packet.destinationIp;
  if (!srcip || !dstip) return 0xffff;
  let protocol = packet.protocol == 17 ? 0x11 : packet.protocol;
  let sum = 0xffff;
  // pseudo header: srcip (16), dstip (16), 0 (8), proto (8), udp len (16)
  if (srcip && dstip) {
    if (typeof srcip === 'string') srcip = Buffer(srcip.split('.'));
    if (typeof dstip === 'string') dstip = Buffer(dstip.split('.'));
    sum = 0;
    let pad = len % 2;
    for (var i = 0; i < len + pad; i += 2) {
      sum += ((data[i]<<8)&0xff00) + ((data[i+1])&0xff);
    }
    for (var i = 0; i < 4; i += 2) {
      sum += ((dstip[i]<<8)&0xff00) + (dstip[i+1]&0xff);
    }
    sum += protocol + len;
    while (sum>>16) {
      sum = (sum & 0xffff) + (sum >> 16);
    }
    sum = 0xffff ^ sum;
  }
  return sum;
};


/**
 * Close the buffer and give back
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
