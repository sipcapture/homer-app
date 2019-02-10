class InfluxdbchartService {
  constructor($http, CONFIGURATION) {
    this.$http = $http;
    this.CONFIGURATION = CONFIGURATION;
  }

  async get(config, path, objQuery) {
    const url = this.CONFIGURATION.APIURL + path;
    if (!objQuery || !objQuery.timestamp) {
      throw new Error(['InfluxdbchartService', 'get'], 'bad objQuery');
    }

    try {
      const resp = await this.$http.post(url, objQuery);
      if (resp && resp.status && resp.status === 200) {
        return resp.data.data ? resp.data.data : resp.data;
      }
      throw new Error(['InfluxdbchartService', 'get'], 'no data');
    } catch (err) {
      throw new Error(['InfluxdbchartService', 'get'], err);
    }
  }
}

export default InfluxdbchartService;
