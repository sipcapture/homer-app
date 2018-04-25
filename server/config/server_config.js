export default {
  http_host: '0.0.0.0',
  http_port: 8006,
  https_host: '0.0.0.0',
  https_port: 8010,
  certificate: {
    self_signed: true,
    days: 1,
  },
  db: {
    type: { // only one type can be true
      mysql: false,
      pgsql: true,
    },
  },
  bcrypt: {
    saltRounds: 10,
  },
};
