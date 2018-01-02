class DashboardStorage {

  constructor($http, $rootScope) {
    this.$http = $http;
    this.$rootScope = $rootScope;
  }

  get(id) {
    return this.$http.get('api/v2/dashboard/store/' + id).then((response) => {
      const dashboard = response.data;
      this.$rootScope.navbar.activeDashboardTitle = dashboard.title;
      return dashboard;
    });
  }

  set(id, data) {
    return this.$http.post('api/v2/dashboard/store/' + id, data).then(function(response) {
      return response.data;
    });
  }

  delete(id) {
    return this.$http.delete('api/v2/dashboard/store/' + id).then(() => {
      return this.getAll();
    }).then((menu) => {
      this.$rootScope.navbar.dashboards = menu;
      return null;
    });
  }

  update(id, data) {
    return this.$http.put('api/v2/dashboard/store/' + id, data).then(() => {
      return this.getAll();
    }).then((menu) => {
      this.$rootScope.navbar.dashboards = menu;
      this.$rootScope.navbar.activeDashboardTitle = data.param.title || this.$rootScope.navbar.activeDashboardTitle;
      return null;
    });
  }

  menu(id, data) {
    return this.$http.post('api/v2/dashboard/menu/' + id, data).then(function(response) {
      return response.data;
    });
  }

  getInfoByID(id) {
    return this.$http.get('api/v2/dashboard/info/' + id).then(function(response) {
      return response.data;
    });
  }

  getAll() {
    return this.$http.get('api/v2/dashboard/info').then(function(response) {
      return response.data;
    });
  }
}

export default DashboardStorage;
