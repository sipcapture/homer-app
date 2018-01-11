import Boom from 'boom';

import search_call_data from './data/search_call_data';

import ef018_call_transaction from './data/transaction/ef0180ef-f6c4-11e7-80ef-000019432987/call_transaction';
import ef018_search_log_report from './data/transaction/ef0180ef-f6c4-11e7-80ef-000019432987/search_log_report';
import ef018_search_qos_report from './data/transaction/ef0180ef-f6c4-11e7-80ef-000019432987/search_qos_report';
import ef018_search_recording_report from './data/transaction/ef0180ef-f6c4-11e7-80ef-000019432987/search_recording_report';
import d2e8b_call_transaction from './data/transaction/d2e8b02b-f6c5-11e7-b02b-000019432987/call_transaction';
import d2e8b_search_log_report from './data/transaction/d2e8b02b-f6c5-11e7-b02b-000019432987/search_log_report';
import d2e8b_search_qos_report from './data/transaction/d2e8b02b-f6c5-11e7-b02b-000019432987/search_qos_report';
import d2e8b_search_recording_report from './data/transaction/d2e8b02b-f6c5-11e7-b02b-000019432987/search_recording_report';
import d2d3a_call_transaction from './data/transaction/d2d3acfd-f6c5-11e7-acfd-000019432987/call_transaction';
import d2d3a_search_log_report from './data/transaction/d2d3acfd-f6c5-11e7-acfd-000019432987/search_log_report';
import d2d3a_search_qos_report from './data/transaction/d2d3acfd-f6c5-11e7-acfd-000019432987/search_qos_report';
import d2d3a_search_recording_report from './data/transaction/d2d3acfd-f6c5-11e7-acfd-000019432987/search_recording_report';

export default [
  {
    /**
     * Search call by parametr
     *
     * @header
     *  @param {string} JWT token - authentication
     */
    path: '/api/v3/search/call/data',
    method: 'POST',
    config: {
      auth: {
        strategy: 'token'
      },
    },
    handler: function (request, reply) {
      // request.params.data = "{"param":{"transaction":{},"limit":200,"search":{},"location":{},"timezone":{"value":-60,"name":"GMT+1 CET","offset":"+0100"}},"timestamp":{"from":1515425482319,"to":1515511882319}}";
      // request.params.data = "{"id":"timerange","param":{"from":"2018-01-08T16:16:46.032Z","to":"2018-01-09T16:16:46.032Z","custom":"Now() - 1440"}}";
      return reply(search_call_data.data);
    }
  },
  {
    /**
     * Search call by transaction
     *
     * @header
     *  @param {string} JWT token - authentication
     */
    path: '/api/v3/call/transaction',
    method: 'POST',
    config: {
      auth: {
        strategy: 'token'
      },
    },
    handler: function (request, reply) {
      const data = request.payload;

      if (data.param.id.uuid === 'd2d3acfd-f6c5-11e7-acfd-000019432987') {
        return reply(d2d3a_call_transaction.data);
      }
      if (data.param.id.uuid === 'd2e8b02b-f6c5-11e7-b02b-000019432987') {
        return reply(d2e8b_call_transaction.data);
      }
      if (data.param.id.uuid === 'ef0180ef-f6c4-11e7-80ef-000019432987') {
        return reply(ef018_call_transaction.data);
      }
      return reply(Boom.notFound('transaction was not found'));
    }
  },
  {
    /**
     * Search qos report
     *
     * @header
     *  @param {string} JWT token - authentication
     */
    path: '/api/v3/call/report/qos',
    method: 'POST',
    config: {
      auth: {
        strategy: 'token'
      },
    },
    handler: function (request, reply) {
      const data = request.payload;
      // "{"timestamp":{"from":1515671129196,"to":1515671434196},"param":{"search":{"id":1,"callid":["c2c59d4a5c47c9d529b3d8af87370029"],"uuid":["ef0180ef-f6c4-11e7-80ef-000019432987"],"uniq":false},"location":{},"transaction":{"call":true,"registration":false,"rest":false},"id":{"uuid":"ef0180ef-f6c4-11e7-80ef-000019432987"},"timezone":{"value":-60,"name":"GMT+1 CET","offset":"+0100"}}}"

      if (data.param.id.uuid === 'd2d3acfd-f6c5-11e7-acfd-000019432987') {
        return reply(d2d3a_search_qos_report.data);
      }
      if (data.param.id.uuid === 'd2e8b02b-f6c5-11e7-b02b-000019432987') {
        return reply(d2e8b_search_qos_report.data);
      }
      if (data.param.id.uuid === 'ef0180ef-f6c4-11e7-80ef-000019432987') {
        return reply(ef018_search_qos_report.data);
      }
      return reply(Boom.notFound('transaction was not found'));
    }
  },
  {
    /**
     * Search log report
     *
     * @header
     *  @param {string} JWT token - authentication
     */
    path: '/api/v3/call/report/log',
    method: 'POST',
    config: {
      auth: {
        strategy: 'token'
      },
    },
    handler: function (request, reply) {
      const data = request.payload;
      // "{"timestamp":{"from":1515671129196,"to":1515671434196},"param":{"search":{"id":1,"callid":["c2c59d4a5c47c9d529b3d8af87370029"],"uuid":["ef0180ef-f6c4-11e7-80ef-000019432987"],"uniq":false},"location":{},"transaction":{"call":true,"registration":false,"rest":false},"id":{"uuid":"ef0180ef-f6c4-11e7-80ef-000019432987"},"timezone":{"value":-60,"name":"GMT+1 CET","offset":"+0100"}}}"

      if (data.param.id.uuid === 'd2d3acfd-f6c5-11e7-acfd-000019432987') {
        return reply(d2d3a_search_log_report.data);
      }
      if (data.param.id.uuid === 'd2e8b02b-f6c5-11e7-b02b-000019432987') {
        return reply(d2e8b_search_log_report.data);
      }
      if (data.param.id.uuid === 'ef0180ef-f6c4-11e7-80ef-000019432987') {
        return reply(ef018_search_log_report.data);
      }
      return reply(Boom.notFound('transaction was not found'));
    }
  },
  {
    /**
     * Search recording report data
     *
     * @header
     *  @param {string} JWT token - authentication
     */
    path: '/api/v3/call/recording/data',
    method: 'POST',
    config: {
      auth: {
        strategy: 'token'
      },
    },
    handler: function (request, reply) {
      const data = request.payload;
      // "{"timestamp":{"from":1515671129196,"to":1515671434196},"param":{"search":{"id":1,"callid":["c2c59d4a5c47c9d529b3d8af87370029"],"uuid":["ef0180ef-f6c4-11e7-80ef-000019432987"],"uniq":false},"location":{},"transaction":{"call":true,"registration":false,"rest":false},"id":{"uuid":"ef0180ef-f6c4-11e7-80ef-000019432987"},"timezone":{"value":-60,"name":"GMT+1 CET","offset":"+0100"}}}"

      if (data.param.id.uuid === 'd2d3acfd-f6c5-11e7-acfd-000019432987') {
        return reply(d2d3a_search_recording_report.data);
      }
      if (data.param.id.uuid === 'd2e8b02b-f6c5-11e7-b02b-000019432987') {
        return reply(d2e8b_search_recording_report.data);
      }
      if (data.param.id.uuid === 'ef0180ef-f6c4-11e7-80ef-000019432987') {
        return reply(ef018_search_recording_report.data);
      }
      return reply(Boom.notFound('transaction was not found'));
    }
  }
];
