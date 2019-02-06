import Joi from 'joi';

const client = require('prom-client');

const collectDefaultMetrics = client.collectDefaultMetrics;
const Registry = client.Registry;
const register = new Registry();

collectDefaultMetrics({register, timeout: 1000});

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
        },
      },
    },
    handler: function(request, reply) {
      let metricData = [];
      let metricsValues = request.payload.metrics;
      const timestampMetrics = register.getMetricsAsJSON();
      const prometheusMetrics = {};

      timestampMetrics.map(function({name, values}) {
        if (!values[0].timestamp) {
          return;
        }

        prometheusMetrics[name] = {
          name: name,
          values: [values[0]],
        };
      });

      metricsValues.forEach((metric) => {
        for (let key in prometheusMetrics) {
          if (key === metric) {
            metricData.push(prometheusMetrics[key]);
          }
        }
      });

      return reply(metricData);
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
      let metricsArr = [];
      const metrics = register.getMetricsAsJSON();

      metrics.forEach(({name, values}) => {
        if (!values[0].timestamp) {
          return;
        }

        metricsArr.push(name);
      });

      return reply(metricsArr);
    },
  });
};
