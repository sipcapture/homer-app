import Boom from 'boom';

export default function any(server) {
  server.route({
    path: '/api/{any*}',
    method: ['PUT', 'POST', 'GET', 'DELETE'],
    handler: function(request, reply) {
      const accept = request.raw.req.headers.accept;

      // take priority: check header if there’s a JSON REST request
      if (accept && accept.match(/json/)) {
        return reply(Boom.notFound('The resource isn’t available on this server.'));
      }

      return reply({ error: 'Not found' });
    },
  });
};
