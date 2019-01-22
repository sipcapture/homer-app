'use strict';

/**
 * Constants for pcap writer module.
 * @type {Object}
 */
module.exports = {
  M_SEC: 1000000,
  M_SEC_F: 1000000.0,
  INT_BASE: 10,
  HEADER_ENCODING: 'hex',
  TCPDUMP_MAGIC: 0xA1B2C3D4,
  PCAP_VERSION_MAJOR: 2,
  PCAP_VERSION_MINOR: 4,
  ZERO: 0,
  DEFAULT_SNAPLEN: 1500,
  DEFAULT_LINKTYPE: 1,
  BYTE_ORDER: {
    BE: '>',
    LE: '<'
  },
  STRUCT_TYPES: {
    UNSIGNED_SHORT: 'H',
    UNSIGNED_LONG: 'I',
    SIGNED_SHORT: 'h',
    SIGNED_LONG: 'i',
    CHAR_ARRAY: 'A',
    CHAR: 'c'
  }
};
