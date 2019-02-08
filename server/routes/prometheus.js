import Joi from 'joi';

let RequestClient = require('reqclient').RequestClient;

let GetGlobalDataPrometeus = new RequestClient({
  baseUrl: 'http://de7.sipcapture.io:9090/api/v1/',
});

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
      let metricsQueries = [];

      let {from, to} = request.payload.datetime;

      request.payload.metrics.forEach((metricName) => {
        metricsQueries.push(
          GetGlobalDataPrometeus
            .get(`query_range?query=${metricName}&start=${from}&end=${to}&step=60s`),
        );
      });

      Promise
        .all(metricsQueries)
        .then((responses) => {
          let resposeBody = [];

          responses.forEach((metric) => {
            resposeBody.push({
              name: metric.data.result[0].metric.__name__,
              values: metric.data.result[0].values,
            });
          });

          return reply(resposeBody);
        })
        .catch((err) => {
          reply(err);
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
      GetGlobalDataPrometeus.get(`/label/__name__/values?_=1549632301527`)
        .then((response) => {
          reply(response.data);
        })
        .catch((err) => {
          reply(err);
        });
    },
  });
};
