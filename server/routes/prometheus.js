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
          param: Joi.object(),
          timestamp: {
                from: Joi.date().timestamp().required(),
                to: Joi.date().timestamp().required(),
          },
        },
      },
    },
    handler: function(request, reply) {
      const prometheus = new Prometheus(server);
      let metrics = request.payload.param.metrics;
      let precision = request.payload.param.precision || 60;      
      let fromts = (new Date(request.payload.timestamp.from)).getTime()/1000;
      let tots = (new Date(request.payload.timestamp.to)).getTime()/1000;
                         
      prometheus.getValues(metrics, fromts, tots, precision).then(function(data) {
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
