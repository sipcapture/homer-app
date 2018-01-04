class DashboardStorage {

  constructor($http, $rootScope) {
    this.$http = $http;
    this.$rootScope = $rootScope;
  }

  get(id) {
    return this.$http.get('api/v2/dashboard/store/' + id).then((response) => {
      return response ? response.data || [] : [];
    });
  }

  set(id, data) {
    return this.$http.post('api/v2/dashboard/store/' + id, data).then(function(response) {
      return response ? response.data || [] : [];
    });
  }

  delete(id) {
    return this.$http.delete('api/v2/dashboard/store/' + id).then((response) => {
      return response;
    });
  }

  update(id, data) {
    return this.$http.put('api/v2/dashboard/store/' + id, data).then((response) => {
      return response;
    });
  }

  menu(id, data) {
    return this.$http.post('api/v2/dashboard/menu/' + id, data).then(function(response) {
      return response ? response.data || [] : [];
    });
  }

  getInfoByID(id) {
    return this.$http.get('api/v2/dashboard/info/' + id).then(function(response) {
      return response ? response.data || [] : [];
    });
  }

  getAll() {
    return this.$http.get('api/v2/dashboard/info').then(function(response) {
      return response ? response.data || [] : [];
    });
  }
}

export default DashboardStorage;
