class DashboardsMenu {

  constructor($log, $scope, $state, $uibModal, $location, DashboardStorage, ModalHelper, EVENTS) {
    'ngInject';
    this.$log = $log;
    this.$scope = $scope;
    this.$state = $state;
    this.$uibModal = $uibModal;
    this.$location = $location;
    this.DashboardStorage = DashboardStorage;
    this.ModalHelper = ModalHelper;
    this.EVENTS = EVENTS;
  }

  $onInit() {
    this.menu = {
      title: 'Home',
      dashboards: [],
      isOpen: false
    };

    this.loadDashboardsMenu();

    this.$scope.$on(this.EVENTS.DASHBOARD_DELETED, () => {
      this.loadDashboardsMenu().then(() => {
        this.updateTitle();
      });
    });

    this.$scope.$on(this.EVENTS.DASHBOARD_UPDATE_SETTINGS, () => {
      this.loadDashboardsMenu().then(() => {
        this.updateTitle();
      });
    });
  }

  go(dashboard) {
    this.menu.isOpen = false;
    return this.$state.go(this.$state.current, {boardID: dashboard.id}).then(() => {
      this.menu.title = dashboard.name;
    });
  }

  add() {
    this.menu.isOpen = false;
    this.$uibModal.open({
      component: 'addDashboard'
    }).result.then((dashboard) => {
      return this.storeDashboard(dashboard).then((dashboard) => {
        this.menu.dashboards.push(dashboard);
        return this.go(dashboard);
      });
    }).catch((error) => {
      if (this.ModalHelper.isError(error)) {
        this.$log.error('[DashboardsMenu]', '[add dashboard]', error);
      }
    });
  }

  updateTitle() {
    const dashboard = this.menu.dashboards.filter((d) => d.id === this.pathId())[0];
    if (dashboard) {
      this.menu.title = dashboard.name;
    }
  }

  pathId() {
    return this.$location.path().split('/').slice(-1)[0];
  }

  loadDashboardsMenu() {
    return this.DashboardStorage.getAll().then((dashboards) => {
      this.menu.dashboards = dashboards;
    }).catch((error) => {
      this.$log.error('[DashboardsMenu]', '[init menu]', error);
    });
  }

  storeDashboardData(id, data) {
    return this.DashboardStorage.set(id, data);
  }

  storeDashboardMenu(id, menu) {
    return this.DashboardStorage.menu(id, menu);
  }

  storeDashboard(dashboard) {
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
      weight,
      widgets: []
    };

    const menu = {
      id,
      alias,
      protect,
      name,
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
