import Boom from 'boom';
import Joi from 'joi';
import Prometheus from '../classes/prometheus';

export default function statistics(server) {
  server.route({
    path: '/api/v3/prometheus/value',
    method: 'POST',
    config: {
      auth: {
        strategy: 'token',
      },
      validate: {
        payload: {
          metrics: Joi.array(),
          datetime: Joi.object(),
        },
      },
    },
    handler: function(request, reply) {
      const prometheus = new Prometheus(server);
      let metrics = request.payload.metrics;
      let {from, to} = request.payload.datetime;      
            
      prometheus.getValues(metrics, from, to).then(function(data) {
        if (!data) {
            return reply(Boom.notFound('prometheus values has been not found'));
        }
        return reply(data);
     }).catch(function(error) {
         return reply(Boom.serverUnavailable(error));
     });
    },
  });

  server.route({
    path: '/api/v3/prometheus/label',
    method: 'GET',
    config: {
      auth: {
        strategy: 'token',
      },
    },
    handler: function(request, reply) {

      const prometheus = new Prometheus(server);      
      prometheus.getLabels().then(function(data) {
        if (!data) {
            return reply(Boom.notFound('prometheus labels has been not found'));
        }
        return reply(data);
      }).catch(function(error) {
         return reply(Boom.serverUnavailable(error));
      });    
    },
  });
};
