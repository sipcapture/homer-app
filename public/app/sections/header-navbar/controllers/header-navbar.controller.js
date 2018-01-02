import '../style/header-navbar.style.css';

class HeaderNavbar {

  constructor($log, $location, $state, $uibModal, $rootScope, DashboardStorage, ModalHelper, AuthenticationService) {
    'ngInject';
    this.$log = $log;
    this.$location = $location;
    this.$state = $state;
    this.$uibModal = $uibModal;
    this.$rootScope = $rootScope;
    this.DashboardStorage = DashboardStorage;
    this.ModalHelper = ModalHelper;
    this.AuthenticationService = AuthenticationService;
  }

  $onInit() {
    this.$rootScope.navbar = {
      activeDashboardTitle: 'Home',
      dashboards: [],
      isCollapsed: true
    };

    this.navbar = this.$rootScope.navbar;

    this.loadDashboardsMenu().then((dashboards) => {
      this.navbar.dashboards = dashboards;
      return null;
    }).catch((error) => {
      this.$log.error('[HeaderNavbar]', '[init menu]', error);
    });
  }

  logout() {
    this.AuthenticationService.logout().catch((error) => {
      this.$log.error('[HeaderNavbar]', '[init menu]', error);
    });
  }

  goDashboard(dashboard) {
    return this.$state.go('dashboard', {boardID: dashboard.id});
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
    this.$uibModal.open({
      component: 'addDashboard'
    }).result.then((dashboard) => {
      return this.saveDashboard(dashboard).then((item) => {
        this.navbar.dashboards.push(item);
        return this.goDashboard(item);
      });
    }).catch((error) => {
      if (this.ModalHelper.isError(error)) {
        this.$log.error('[HeaderNavbar]', '[add dashboard]', error);
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

export default HeaderNavbar;
