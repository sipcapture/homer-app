class Storage {

  constructor () {
    this.dashboards = {
      'home': {
        id: '1',
        name: 'home',
        view: 'home',
        url: '/home',
        component: 'mainDashboard',
        widgets: [{
          col: 0,
          row: 0,
          sizeY: 1,
          sizeX: 1,
          name: 'Widget 1'
        }, {
          col: 2,
          row: 1,
          sizeY: 1,
          sizeX: 1,
          name: 'Widget 2'
        }]
      },
      'other': {
        id: '2',
        name: 'other',
        view: 'other',
        url: '/other',
        component: 'mainDashboard',
        widgets: [{
          col: 1,
          row: 1,
          sizeY: 1,
          sizeX: 2,
          name: 'Other Widget 1'
        }, {
          col: 1,
          row: 3,
          sizeY: 1,
          sizeX: 1,
          name: 'Other Widget 2'
        }]
      }
    };
  }

  saveDashboards(dashboards) {
    this.dashboards = dashboards;
  }

  listDashboards() {
    return this.dashboards;
  }

}

export { Storage };
