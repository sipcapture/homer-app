import '../style/header-navbar.style.css';

class HeaderNavbar {

  constructor($log, $uibModal, storeService) {
    'ngInject';
    this.$log = $log;
    this.$uibModal = $uibModal;
    this.storeService = storeService;
  }

  $onInit() {
    this.isCollapsed = true;
    this.status = {
      isopen: false
    };

    this.panels = [];
    this.getPanels().then((panels) => {
      this.panels = panels.data;
    }).catch((error) => {
      this.$log.error('[HeaderNavbar]', error);
    });
  }

  getPanels() {
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
      this.$log.info('[HeaderNavbar]', '[close modal]', reason);
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
