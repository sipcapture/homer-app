import {assign} from 'lodash';

class DashboardsMenu {
  constructor($log, $scope, $state, $uibModal, $location, DashboardStorage, ModalHelper, EVENTS, ROUTER, EventBus) {
    'ngInject';
    this.$log = $log;
    this.$scope = $scope;
    this.$state = $state;
    this.$uibModal = $uibModal;
    this.$location = $location;
    this.DashboardStorage = DashboardStorage;
    this.ModalHelper = ModalHelper;
    this.EVENTS = EVENTS;
    this.ROUTER = ROUTER;
    this.EventBus = EventBus;
  }

  $onInit() {
    this.menu = {
      title: 'Home',
      isOpen: false,
    };

    this.EventBus.subscribe(this.EVENTS.DASHBOARD_DELETED, (event, forDelete) => {
      this.dashboards = this.deleteDashboard(forDelete.dashboardId);
      this.menu.title = 'Home';
    });

    this.EventBus.subscribe(this.EVENTS.DASHBOARD_UPDATE_SETTINGS, (event, forUpdate) => {
      this.updateDashboard(forUpdate.dashboardId, forUpdate.update);
      this.menu.title = this.updateTitle();
    });
  }

  go(dashboard) {
    this.menu.isOpen = false;
    return this.$state.go(this.ROUTER.DASHBOARD.NAME, {boardID: dashboard.id}).then(() => {
      this.menu.title = dashboard.name;
    });
  }

  add() {
    this.menu.isOpen = false;
    this.$uibModal.open({
      component: 'addDashboard',
    }).result.then((dashboard) => {
      return this.storeDashboard(dashboard).then((dashboard) => {
        this.dashboards.push(dashboard);
        return this.go(dashboard);
      });
    }).catch((error) => {
      if (this.ModalHelper.isError(error)) {
        this.$log.error(['DashboardsMenu'], ['add dashboard'], error);
      }
    });
  }

  deleteDashboard(dashId) {
    return this.dashboards.filter((d) => d.id !== dashId);
  }

  updateTitle() {
    const currentDash = this.dashboards.filter((d) => d.id === this.pathId())[0];
    if (currentDash) {
      return currentDash.name;
    }
    this.$log.error(['DashboardsMenu'], ['add dashboard'], 'fail to find current dashboard name');
    return 'Dashboard';
  }

  updateDashboard(dashId, update) {
    const index = this.dashboards.findIndex((d) => d.id === dashId);
    this.dashboards[index] = assign(this.dashboards[index], update);
  }

  pathId() {
    return this.$location.path().split('/').slice(-1)[0];
  }

  loadDashboardsMenu() {
    return this.DashboardStorage.getAll().then((dashboards) => {
      this.dashboards = dashboards;
    }).catch((error) => {
      this.$log.error(['DashboardsMenu'], ['init menu'], error);
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
    // const currentUser = authService.getCurrentLoginUser(); // to-do: introduce user scopes
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
      // uuid: currentUser.uuid, //to-do: introduce user scopes
      // gid: currentUser.gid,
      weight,
      widgets: [],
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
      icon: '',
    };

    return this.storeDashboardData(data.id, data).then(() => {
      return this.storeDashboardMenu(menu.id, menu);
    }).then(() => menu);
  }
}

export default DashboardsMenu;
