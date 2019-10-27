export default function proxy(server, config) {
  const {host, port, protocol, path, headers} = config;

  server.route({
    method: 'GET',
    path: '/api/v3/proxy/grafana/folders',
    handler: {
      proxy: {
        mapUri: function(req, cb) {
          const url = `${protocol}://${host}:${port}`+`/api/search?folderIds=0`          
          return cb(null, url, headers);
        },
        onResponse: function(err, res, req, reply) {
          return reply(res);
        },
      },
    },
  });
  
   server.route({
    method: 'GET',
    path: '/api/v3/proxy/grafana/dashboards/uid/{uid}',
    handler: {
      proxy: {
        mapUri: function(req, cb) {
          const {uid} = req.params;
          const url = `${protocol}://${host}:${port}`+`/api/dashboards/uid/`+uid;          
          return cb(null, url, headers);
        },
        onResponse: function(err, res, req, reply) {
          return reply(res);
        },
      },
    },
  });
  
  server.route({
    method: 'GET',
    path: '/api/v3/proxy/grafana/url',
    handler: function(request, reply) {
        let url = {data: `${protocol}://${host}:${port}`};        
        return reply(url);
    },
  });
  
  
  server.route({
    method: 'GET',
    path: '/api/v3/proxy/grafana/org',
    handler: {
      proxy: {
        mapUri: function(req, cb) {
          const url = `${protocol}://${host}:${port}`+`/api/org`          
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
    path: '/api/v3/proxy',
    handler: {
      proxy: {
        mapUri: function(req, cb) {

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
    path: '/api/v3/proxy',
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
