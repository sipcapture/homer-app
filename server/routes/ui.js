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
    path: '/{path*}',
    handler: function (request, reply) {

        var path = request.params.path;
        var matchJs = path.match(/(.+\/)?(.+\.js)$/);
	var matchCss = path.match(/(.+\/)?(.+\.css)$/);
        if (matchJs || matchCss) {
            var filename = matchJs ? matchJs[2] : matchCss[2];
	    reply.file('public/'+ filename);
	} else {
            reply.file('public/index.html');
	}
	return;
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

};
