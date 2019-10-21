export default function ui(server) {
 server.route({
    method: 'GET',
    config: {
        cors: {
            origin: ['*'],
            additionalHeaders: ['cache-control', 'x-requested-with']
        }
    },
    path: '/assets/{param*}',
    handler: {
      directory: {
          path: './public/assets',
          listing: false,
          index: true
      }
    }
  });
  
  server.route({
    method: 'GET',
    config: {
        cors: {
            origin: ['*'],
            additionalHeaders: ['cache-control', 'x-requested-with']
        }
    },
    path: '/js/{param*}',
    handler: {
      directory: {
          path: './public/js',
          listing: false,
          index: true
      }
    }
  });
  
  server.route({
    method: 'GET',
    config: {
        cors: {
            origin: ['*'],
            additionalHeaders: ['cache-control', 'x-requested-with']
        }
    },
    path: '/favicon.ico',
    handler: function (request, reply) {
      // reply.file() expects the file path as parameter
      reply.file('public/favicon.ico');
    }
  });

  server.route({
    method: 'GET',
    config: {
        cors: {
            origin: ['*'],
            additionalHeaders: ['cache-control', 'x-requested-with']
        }
    },
    path: '/{p*}',
    handler: function (request, reply) {
         reply.file('public/index.html');
    }
  });
};
