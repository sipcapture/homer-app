import _ from 'lodash';

var injectParams = ['$scope', '$state', '$stateParams', 
'eventbus','$timeout','$q','$rootScope',
'storeService','authService', 'SweetAlert',
'EVENTS', 'CONFIGURATION', 'dashboardResolver'];

var dashboardController = function($scope, $state, $stateParams, eventbus, $timeout, $q, $rootScope, storeService, authService, SweetAlert, EVENTS, CONFIGURATION, dashboardResolver) {

  $scope.gridsterOptions = CONFIGURATION.DASHBOARD_DEFAULT;
  var resizable = {
    enabled: true,
    handles: ['n', 'e', 's', 'w', 'ne', 'se', 'sw', 'nw'],
    // optional callback fired when resize is started
    start: function(event, $element, widget) {},
    // optional callback fired when item is resized,
    resize: function(event, $element, widget) {
      if (widget.api && widget.api.resizeUpdate) widget.api.resizeUpdate();
    },
    // optional callback fired when item is finished resizing 
    stop: function(event, $element, widget) {
      $timeout(function(){
        if (widget.api && widget.api.resizeUpdate) widget.api.resizeStop();
      },400)
    }
  };
  
  $scope.gridsterOptions.resizable = resizable;
  $scope.dashboardEditDisable = true;
  $scope.dashboards = {};
  
  if($state.current.name == "dashboard/search") {
    $stateParams.boardID = "search";
  } else if($state.current.name == "dashboard/home") {
    $stateParams.boardID = "home";
  }
  
  //console.log("ONCE!");
  //console.log($state.current);
  //console.log($stateParams.boardID);
  
  this.name = $stateParams.boardID;
  var that = this;		
  $scope.boardId = $stateParams.boardID;
  
  storeService.get($stateParams.boardID).then(function (status) {
    var currentUser = authService.getCurrentLoginUser();
    $rootScope.dashboardEditable = false;
    
    console.log("BOARD", status);
    console.log("USER", currentUser);
    if(currentUser.permissions && currentUser.permissions.indexOf("admins") > -1) {
      $scope.dashboardEditDisable = false;                                                
    }
    if(status.uuid && status.uuid != currentUser.uuid) {
      $scope.dashboardEditDisable = true;
    }
    else $scope.dashboardEditDisable = false;
    
    var parsedDashboard = angular.fromJson(status);                                                
    
    if(status && status.config) {
      status.config.resizable = resizable;
      $scope.gridsterOptions = status.config;                        
    }
    
    if(status && status.widgets) {
      //console.log(status.widgets);
      var newWidgets = {};
      //var widgets = app.dashboard.getWidgets();
      var widgets = dashboardResolver.getWidgets();
      //console.log(status.widgets);                        
      //
      angular.forEach(status.widgets, function(value, key) {
        //console.log("RRR:", value.name);
        if(!value.api) {
          value.api = {};
        }
        if(!widgets[value.name] && !newWidgets[value.name]) {	
          newWidgets[value.name] = 'widgets/'+value.name+'/'+value.name+'.js';
        } 
      });
      
      //console.log("AFTER", status.widgets);
      
      //console.log("Doesn't exists:", newWidgets);
      if(Object.keys(newWidgets).length === 0) {
        $scope.dashboard = parsedDashboard;
      } else {                                                
        var dataArray = Object.keys(newWidgets).map(function(k){return newWidgets[k]});
        var promise = resolveMultiple(dataArray);
        promise.then(function(payload) { 
          //console.log("done");
          $scope.dashboard = parsedDashboard;		                                                                
        }, function(errorPayload) {
        //console.log("error");
        });                                
      };                                                
    }
    //$scope.dashboards[1] = parsedDashboard;
    //$scope.dashboard = $scope.dashboards[1];		                                        
  });
  
  $scope.clear = function() {
    $scope.dashboard.widgets = [];
  };
  
  $scope.addNewWidget = function() {
    //console.log("ADD => WIDGET");
    eventbus.broadcast(EVENTS.DASHBOARD_LIST_WIDGET, "1");
  };
  
  $scope.editBoard = function() {
    //console.log("EDIT", $scope);
    eventbus.broadcast(EVENTS.DASHBOARD_EDIT, $scope.dashboard);
  };
  
  $scope.deleteBoard = function(){
    var id = $scope.boardId;
    SweetAlert.swal({
      title: "Are you sure?",
      text: "Your will not be able to recover this!",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "Yes, delete it!",
      closeOnConfirm: true,
      closeOnCancel: true
    }, function(isConfirm){  
      if(isConfirm) {
        if($scope.dashboard) {
          $scope.dashboard.widgets = [];
        }
        storeService.delete(id);                                        
        $state.go('dashboard', { boardID: 'home' });
        eventbus.broadcast(EVENTS.DASHBOARD_CHANGED, id);
      }
    });
  };
  
  
  $scope.saveBoard = function() {
    console.log($scope.dashboard);
    if(!$scope.dashboard) $scope.dashboard = {};
    
    //var currentUser = authService.getCurrentLoginUser();		        		        
    //if(!$scope.dashboard.uuid) $scope.dashboard.uuid = currentUser.uuid;
    //if(!$scope.dashboard.gid) $scope.dashboard.gid = currentUser.gid;
    
    $scope.dashboard.config = $scope.gridsterOptions;		        
    $scope.dashboardJSON = angular.toJson($scope.dashboard);
    storeService.set($scope.dashboard.alias, $scope.dashboardJSON);		        
    //console.log("SAVE IT");
    //applyUpdateDashboardChanges($scope.dashboard);
  };
  
  $scope.restoreBoard = function() {
    //factory.get
    var parsedDashboard = angular.fromJson($scope.dashboardJSON);
    $scope.dashboards[1] = parsedDashboard;
    $scope.dashboard = $scope.dashboards[1];		                                        
    //console.log("Restore IT");
  };
  
  var applyNewDashboardChanges = function(dashboard) {
    console.log(dashboard);
    //console.log($scope.dashboard);
    $scope.dashboard.config = dashboard.config;
    $scope.gridsterOptions = $scope.dashboard.config;                        
    $scope.dashboard.name =  dashboard.name;
    $scope.dashboard.title =  dashboard.name;
    $scope.dashboard.alias  = dashboard.type;
    $scope.dashboard.shared  = dashboard.shared;
  };
  
  var applyUpdateDashboardChanges = function(dashboard) {
    console.log(dashboard);
    var data = {};		        
    data.param = { shared: 0};
    
    if(dashboard.data.name) data.param['title'] = dashboard.data.name;
    if(dashboard.data.shared) data.param['shared'] = 1;
    if(dashboard.data.param) data.param['param'] = dashboard.data.param;
    
    storeService.update(dashboard.id, data).then(function (status) {
      console.log("DONE");
      eventbus.broadcast(EVENTS.DASHBOARD_CHANGED, "1");		                            
    });                                		        
  };
  
  var addWidgetToBoard = function (name) {
    //widgets = app.dashboard.getWidgets();
    widgets = dashboardResolver.getWidgets();
    //console.log(name);
    
    if(!$scope.dashboard) $scope.dashboard = {};                
    if(!$scope.dashboard.widgets) $scope.dashboard.widgets = [];                
    
    if(!widgets[name]) {			
      var promise = resolveWidget(name);
      promise.then(function(payload) { 
        //console.log("done", name);
        //widgets = app.dashboard.getWidgets();
        widgets = dashboardResolver.getWidgets();
        if(widgets[name]) {
          //console.log("ADDED");
          var lwdig = {};
          angular.copy(widgets[name],lwdig);                                                                                                                                
          //console.log(widgets[name]);
          //console.log(lwdig);
          
          $scope.dashboard.widgets.push(lwdig);
        };				
      }, function(errorPayload) {
      //console.log("error");
      });
    }
    else {
      //console.log("CACHE ADDED");
      //console.log(widgets[name]);
      //console.log($scope.dashboard.widgets);
      var lwdig = {};
      angular.copy(widgets[name],lwdig);
      $scope.dashboard.widgets.push(lwdig);
    }				        																				
  };
  
  
  $scope.$watch('selectedDashboardId', function(newVal, oldVal) {
    if (newVal !== oldVal) {
      $scope.dashboard = $scope.dashboards[newVal];
    } else {
      $scope.dashboard = $scope.dashboards[1];
    }
  });
  
  // init dashboard
  $scope.selectedDashboardId = '1';
  
  
  /*resolve*/		
  var resolveWidget = function (widgetName) {
    var widgetStr = "widgets/"+widgetName+"/"+widgetName+".js";		        
    var dependencies = [widgetStr];
    
    var defer = $q.defer()
    _.forEach(dependencies, (module) => {
      console.log('------------------ resolveWidget');
      console.log('module');
      console.log(module);
      import(module).then(m => {
        defer.resolve();
        $rootScope.$apply()
      }).catch(console.error);
    });
    //require(dependencies, function () {
    //  	defer.resolve();
    //        $rootScope.$apply()
    //});
    
    return defer.promise;
  };
  
  /*resolve*/		
  var resolveMultiple = function (dependencies) {
    var defer = $q.defer()
    _.forEach(dependencies, (module) => {
      console.log('------------------ resolveMultiple');
      console.log('module');
      console.log(module);
      import(module)
      .then(m => {
        defer.resolve();
        $rootScope.$apply()
      }).catch(console.error);
    });
    //        //console.log("b");
    //        require(dependencies, function () {
    //          	defer.resolve();
    //                $rootScope.$apply()
    //        });
    return defer.promise;
  };
  
  var resolveDependencies = function ($q, $rootScope, dependencies) {
    var defer = $q.defer()
    //console.log("b");
    _.forEach(dependencies, (module) => {
      console.log('------------------ resolveDependencies');
      console.log('module');
      console.log(module);
      import(module).then(m => {
        defer.resolve();
        $rootScope.$apply()
      }).catch(console.error);
    });
    //require(dependencies, function () {
    //      defer.resolve();
    //	    $rootScope.$apply()
    //});
    return defer.promise;
  };
  
  var sendRefreshToWidgets = function() {	
    console.log("Restore IT");
    angular.forEach($scope.dashboard.widgets, function(wd, key) {
      if(wd.refresh && wd.api.refresh) {
        wd.api.refresh();
      }
    });
  };
  
  
  $scope.selectedDashboardId = '1';
  
  /************************* EVENTS  *************************************/
  var deregisterAddNewWidgets = eventbus.subscribe(EVENTS.DASHBOARD_ADD_WIDGET, function (event, widget) {
    //console.log("ZZZZZZZZZ");
    addWidgetToBoard(widget);
  });
  
  var deregisterApplyNewDashboardSettings = eventbus.subscribe(EVENTS.DASHBOARD_NEW_SETTINGS, function (event, dashboard) {
    //console.log("NEW", dashboard);
    applyNewDashboardChanges(dashboard);
  });
  
  var deregisterApplyUpdateDashboardSettings = eventbus.subscribe(EVENTS.DASHBOARD_UPDATE_SETTINGS, function (event, dashboard) {
    console.log("NEW", dashboard);
    applyUpdateDashboardChanges(dashboard);
  });
  
  var deregisterWidgetsReloadSettings = eventbus.subscribe(EVENTS.WIDGETS_GLOBAL_RELOAD, function (event, dashboard) {
    console.log("GLOBAL", dashboard);
    sendRefreshToWidgets();
  });
  
  // cancel interval on scope destroy
  $scope.$on('$destroy', function(){
    //console.log("destroy old dashboard"); 
    deregisterAddNewWidgets();
    deregisterApplyNewDashboardSettings();
    deregisterWidgetsReloadSettings();
    deregisterApplyUpdateDashboardSettings();
    //eventbus.subscribe(EVENTS.DASHBOARD_NEW_ITEM, function(event, args) {			
  });    

};

//console.log("LETSREGISTER TWICE");


dashboardController.$inject = injectParams;
export default dashboardController;
