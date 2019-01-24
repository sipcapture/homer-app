class AdvancedService {
  constructor($http, API) {
    this.$http = $http;
    this.API = API.PREFERENCES.ADVANCED;
  }

  /*
  * @return {object} data and schema
  *   {array} data
  *   {object} schema
  */
  async getAll() {
    try {
      const resp = await this.$http.get(this.API.GETALL);
      if (resp.status >= 400) {
        throw new Error(resp.data.message || resp.data.error);
      }

      return resp.data.data;
    } catch (err) {
      throw new Error(`fail to get all alias: ${err.message}`);
    }
  }

  /*
  * @return {object} API confirm
  */
  async add({alias, ip, port, mask, captureID, status}) {
    try {
      const a = {alias, ip, port, mask, captureID, status};
      const resp = await this.$http.post(this.API.ADD, a);
      if (resp.status >= 400) {
        throw new Error(resp.data.message || resp.data.error);
      }
    
      return resp;
    } catch (err) {
      throw new Error(`fail to add alias: ${err.message}`);
    }
  }

  /*
  * @return {object} API confirm
  */
  async update({guid, alias, ip, port, mask, captureID, status}) {
    try {
      const a = {alias, ip, port, mask, captureID, status};
      const resp = await this.$http.put([this.API.UPDATE, guid].join('/'), a);
      if (resp.status >= 400) {
        throw new Error(resp.data.message || resp.data.error);
      }
    
      return resp;
    } catch (err) {
      throw new Error(`fail to update alias: ${err.message}`);
    }
  }

  /*
  * @return {object} API confirm
  */
  async delete(guid) {
    try {
      const resp = await this.$http.delete([this.API.DELETE, guid].join('/'));
      if (resp.status >= 400) {
        throw new Error(resp.data.message || resp.data.error);
      }
    
      return resp;
    } catch (err) {
      throw new Error(`fail to delete alias: ${err.message}`);
    }
  }
}

export default AdvancedService;
