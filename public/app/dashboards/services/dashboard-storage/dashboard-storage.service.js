import {has} from 'lodash';

class DashboardStorage {
  constructor($http, $rootScope, API) {
    this.$http = $http;
    this.$rootScope = $rootScope;
    this.API = API;
  }

  get(id) {
    return this.$http.get(this.API.DASHBOARD.STORE+'/'+id).then(function(response) {
      return has(response, 'data.data') ? response.data.data : response.data || [];
    });
  }

  set(id, data) {
    return this.$http.post(this.API.DASHBOARD.STORE+'/'+id, data).then(function(response) {
      return has(response, 'data.data') ? response.data.data : response.data || [];
    });
  }

  delete(id) {
    return this.$http.delete(this.API.DASHBOARD.STORE+'/'+id).then(function(response) {
      return response;
    });
  }

  update(id, data) {
    return this.$http.put(this.API.DASHBOARD.STORE+'/'+id, data).then(function(response) {
      return has(response, 'data.data') ? response.data.data : response.data || [];
    });
  }

  menu(id, data) {
    return this.$http.post(this.API.DASHBOARD.MENU+'/'+id, data).then(function(response) {
      return has(response, 'data.data') ? response.data.data : response.data || [];
    });
  }

  getInfoByID(id) {
    return this.$http.get(this.API.DASHBOARD.INFO+'/'+id).then(function(response) {
      return has(response, 'data.data') ? response.data.data : response.data || [];
    });
  }

  getAll() {
    return this.$http.get(this.API.DASHBOARD.INFO).then(function(response) {
      return has(response, 'data.data') ? response.data.data : response.data || [];
    });
  }
}

export default DashboardStorage;
