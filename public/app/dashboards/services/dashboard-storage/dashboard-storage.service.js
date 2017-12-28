class DashboardStorage {

  constructor($http) {
    this.$http = $http;
  }

  get(id) {
    return this.$http.get('api/v2/dashboard/store/' + id).then(function (response) {
      return response.data.data;
    });
  }

  set(id, data) {
    return this.$http.post('api/v2/dashboard/store/' + id, data).then(function (response) {
      return response.data;
    });
  }

  delete(id) {
    return this.$http.delete('api/v2/dashboard/store/' + id).then(function (response) {
      return response.data;
    });
  }

  update(id, data) {
    return this.$http.put('api/v2/dashboard/store/' + id, data).then(function (response) {
      return response.data;
    });
  }

}

export default DashboardStorage;
