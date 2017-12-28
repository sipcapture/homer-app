/************************************************************************************/

var injectPanelParams = [
  '$scope',
  '$location',
  '$rootScope',
  'eventbus',
  'storeService',
  'EVENTS',
  '$log'
];
                                       
var PanelController = function ($scope, $location, $rootScope, eventbus, storeService, EVENTS, $log) {
  $scope.showChilds = function(item) {
    item.active = !item.active;
  };

  $scope.isActive = function(route) {
    return route === $location.path();
  };

  var deregisterDashboardChanged = eventbus.subscribe(EVENTS.DASHBOARD_CHANGED, function() {
    storeService.getAll()
      .then(function(status) {
        $scope.items = status.data;
      }, function() {})['finally'](function() {});
  });

  eventbus.broadcast(EVENTS.DASHBOARD_CHANGED, '1');
  
  var deregisterListener = eventbus.subscribe(EVENTS.DASHBOARD_NEW_ITEM, function(event, args) {
    $scope.addNewDashboard(args);
  });

  $scope.addNewDashboard = function(dashboard) {
    var id = '_' + new Date().getTime();
    //var currentUser = authService.getCurrentLoginUser();
    var name = dashboard.name;
    var type = dashboard.type;
    var param = '';
    var alias = id;
    var protect = false;
    var weight = 10;
    var stype = 0;
    var shared = 0;

    if (type !== 'custom' && type !== 'frame') {
      alias = type;
      protect = true;
      weight = 0;
    }

    if (type === 'frame') {
      stype = 1;
      param = dashboard.param;
    }

    var dataBoard = {
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

    storeService.set(id, dataBoard)
      .catch(function (error) {
        $log.error('[Panel]', error);
      });
    
    /* create menu */
    var data = {
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

    storeService.menu(id, data)
      .then(function () {
        eventbus.broadcast(EVENTS.DASHBOARD_CHANGED, name);
      })
      .catch(function (error) {
        $log.error('[Panel]', error);
      });
  };
  
  // cancel interval on scope destroy
  $scope.$on('$destroy', function(){
    deregisterListener();
    deregisterDashboardChanged();
  });
                      
};

PanelController.$inject = injectPanelParams;
export default PanelController;
