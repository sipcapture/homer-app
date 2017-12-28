import '../style/header-navbar.style.css';

class HeaderNavbar {

  constructor($log, $location, $state, $uibModal, $scope, storeService) {
    'ngInject';
    this.$log = $log;
    this.$location = $location;
    this.$state = $state;
    this.$uibModal = $uibModal;
    this.$scope = $scope;
    this.storeService = storeService;
  }

  $onInit() {
    this.isCollapsed = true;
    this.status = {
      isopen: false,
      activeDashboardName: this.$state.current.name || this.getDashboardNameFromUrl() || 'Home'
    };

    this.dashboards = [];
    this.getDashboards().then((dashboards) => {
      this.dashboards = dashboards.data;
    }).catch((error) => {
      this.$log.error('[HeaderNavbar]', '[load dashboards list]', error);
    });
  }

  getDashboardNameFromUrl() {
    const name = this.$location.$$url.split('/').slice(-1)[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  goDashboard(dashboard) {
    this.$state.go('dashboard', {boardID: dashboard.href});
    this.status.activeDashboardName = dashboard.name;
  }

  getDashboards() {
    return this.storeService.getAll();
  }

  setData(id, data) {
    return this.storeService.set(id, data);
  }

  setMenu(id, menu) {
    return this.storeService.menu(id, menu);
  }

  addDashboard() {
    this.$uibModal.open({
      component: 'addDashboard'
    }).result.then((dashboard) => {
      return this.saveDashboard(dashboard).catch((error) => {
        this.$log.error('[HeaderNavbar]', '[save dashboard]', error);
      });
    }).catch((reason) => {
      this.$log.info('[HeaderNavbar]', '[add dashboard modal]', reason);
    });
  }

  saveDashboard(dashboard) {
    const id = '_' + new Date().getTime();
    //var currentUser = authService.getCurrentLoginUser();
    let name = dashboard.name;
    let type = dashboard.type;
    let param = '';
    let alias = id;
    let protect = false;
    let weight = 10;
    let stype = 0;
    let shared = 0;

    if (type !== 'custom' && type !== 'frame') {
      alias = type;
      protect = true;
      weight = 0;
    }

    if (type === 'frame') {
      stype = 1;
      param = dashboard.param;
    }

    const data = {
      id: id,
      name: name,
      alias: alias,
      selectedItem: '',
      type: stype,
      param: param,
      shared: shared,
      //uuid: currentUser.uuid,
      //gid: currentUser.gid,
      title: name,
      weight: 10,
      widgets: []
    };

    const menu = {
      param: {
        id,
        protect,
        title: name,
        type: stype,
        param,
        weight,
        shared,
        alias,
        icon: ''
      }
    };

    return this.setData(data.id, data).then(() => {
      return this.setMenu(menu.param.id, menu);
    });
  }
  
}

export default HeaderNavbar;
