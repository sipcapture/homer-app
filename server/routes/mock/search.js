import search_call_data from './data/search_call_data';

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
  }
];
