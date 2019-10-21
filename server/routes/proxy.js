export default function proxy(server, config) {
  const {host, port, protocol, path, authCookie} = config;

  server.route({
    method: 'GET',
    path,
    handler: {
      proxy: {
        mapUri: function(req, cb) {
          let {path, headers} = req;
          path = path.replace('v3', 'v2');
          const url = `${protocol}://${host}:${port}${path}`;
          headers.cookie = authCookie;
          return cb(null, url, headers);
        },
        onResponse: function(err, res, req, reply) {
          return reply(res);
        },
      },
    },
  });

  server.route({
    method: 'POST',
    config: {
        cors: {
            origin: ['*'],
            additionalHeaders: ['cache-control', 'x-requested-with']
        }
    },
    path,
    handler: {
      proxy: {
        mapUri: function(req, cb) {
          let {path, headers} = req;
          path = path.replace('v3', 'v2');
          const url = `${protocol}://${host}:${port}${path}`;
          headers.cookie = authCookie;
          return cb(null, url, headers);
        },
        onResponse: function(err, res, req, reply) {
          return reply(res);
        },
      },
    },
  });

  server.route({
    method: 'PUT',
    path,
    handler: {
      proxy: {
        mapUri: function(req, cb) {
          let {path, headers} = req;
          path = path.replace('v3', 'v2');
          const url = `${protocol}://${host}:${port}${path}`;
          headers.cookie = authCookie;
          return cb(null, url, headers);
        },
        onResponse: function(err, res, req, reply) {
          return reply(res);
        },
      },
    },
  });
};
