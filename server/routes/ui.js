export default function ui(server) {
  server.route({
    method: 'GET',
    config: {
        cors: {
            origin: ['*'],
            additionalHeaders: ['cache-control', 'x-requested-with']
        }
    },
    path: '/{any*}',
    handler: {
      directory: {
        path: ['public'],
        listing: false,
        index: ['index.html'],
        redirectToSlash: true
      },
    },
  });
};
