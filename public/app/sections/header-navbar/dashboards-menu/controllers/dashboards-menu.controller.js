class DashboardsMenu {

  constructor($log, $location, $state, $uibModal, $rootScope, DashboardStorage, ModalHelper, AuthenticationService, ROUTER) {
    'ngInject';
    this.$log = $log;
    this.$location = $location;
    this.$state = $state;
    this.$uibModal = $uibModal;
    this.$rootScope = $rootScope;
    this.DashboardStorage = DashboardStorage;
    this.ModalHelper = ModalHelper;
    this.AuthenticationService = AuthenticationService;
    this.ROUTER = ROUTER;
  }

  $onInit() {

    this.menu = {
      title: 'Home',
      dashboards: [],
      isOpen: false
    };

    this.loadDashboardsMenu().then((dashboards) => {
      this.menu.dashboards = dashboards;
      return null;
    }).catch((error) => {
      this.$log.error('[DashboardsMenu]', '[init menu]', error);
    });
  }

  openDashboardsMenu() {
    this.loadDashboardsMenu().then((dashboards) => {
      this.menu.dashboards = dashboards;
      return null;
    }).catch((error) => {
      this.$log.error('[DashboardsMenu]', '[init menu]', error);
    });
  }

  logout() {
    this.AuthenticationService.logout().catch((error) => {
      this.$log.error('[DashboardsMenu]', '[init menu]', error);
    });
  }

  goDashboard(dashboard) {
    this.menu.isOpen = false;
    return this.$state.go(this.ROUTER.DASHBOARD.NAME, {boardID: dashboard.id}).then(() => {
      this.menu.title = dashboard.title;
    });
  }

  loadDashboardsMenu() {
    return this.DashboardStorage.getAll();
  }

  storeDashboardData(id, data) {
    return this.DashboardStorage.set(id, data);
  }

  storeDashboardMenu(id, menu) {
    return this.DashboardStorage.menu(id, menu);
  }

  addDashboard() {
    this.menu.isOpen = false;
    this.$uibModal.open({
      component: 'addDashboard'
    }).result.then((dashboard) => {
      return this.saveDashboard(dashboard).then((item) => {
        this.menu.dashboards.push(item);
        return this.goDashboard(item);
      });
    }).catch((error) => {
      if (this.ModalHelper.isError(error)) {
        this.$log.error('[DashboardsMenu]', '[add dashboard]', error);
      }
    });
  }

  saveDashboard(dashboard) {
    const id = '_' + new Date().getTime();
    //var currentUser = authService.getCurrentLoginUser(); // to-do: introduce user scopes
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
      id,
      alias,
      name,
      selectedItem: '',
      type: stype,
      param,
      shared,
      //uuid: currentUser.uuid, //to-do: introduce user scopes
      //gid: currentUser.gid,
      title: name,
      weight: 10,
      widgets: []
    };

    const menu = {
      id,
      alias,
      protect,
      title: name,
      type: stype,
      param,
      weight,
      shared,
      icon: ''
    };

    return this.storeDashboardData(data.id, data).then(() => {
      return this.storeDashboardMenu(menu.id, menu);
    }).then(() => menu);
  }
  
}

export default DashboardsMenu;
