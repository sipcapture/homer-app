    var injectParams = ['$scope', '$state', '$stateParams', '$sce',
                        'eventbus','$timeout','$q','$rootScope',
                        'storeService','authService', 'SweetAlert',
                        'EVENTS', 'CONFIGURATION'];
    

    var dashframeController = function($scope, $state, $stateParams, $sce, eventbus, $timeout, $q, $rootScope, storeService, authService, SweetAlert, EVENTS, CONFIGURATION) {

		$scope.dashframes = {};

		this.name = $stateParams.boardID;
		var that = this;		
		$scope.boardId = $stateParams.boardID;
		$scope.showFrame = false;
		$scope.param = "";
		$scope.dashframe = {};
		                                        
		
		storeService.getInfoByID($stateParams.boardID).then(function (info) {

		        console.log(status);
                        var currentUser = authService.getCurrentLoginUser();
                        if(currentUser.permissions && currentUser.permissions.indexOf("admins") > -1) $rootScope.dashframeEditable = true;                        
                        
                        $scope.dashframe.name = info.data.name;                                                                
                        $scope.dashframe.id = info.data.id;   
                        $scope.dashframe.type = info.data.type;
                        $scope.dashframe.param = info.data.param;
                        $scope.dashframe.weight = info.data.weight;
                        $scope.dashframe.alias = info.data.alias;
                        
                        $scope.showFrame = true;                        
                        $scope.currentUrl= $sce.trustAsResourceUrl(info.data.param);                        
                        
                        console.log(info);
		});


		var applyNewDashFrameChanges = function(dashframe) {
                   

		        console.log("FRAME");
                        $scope.dashframe.name =  dashframe.name;
                        $scope.dashframe.title =  dashframe.name;
                        $scope.dashframe.param  = dashframe.param;
                        $scope.dashframe.type  = 1;
                        $scope.dashframe.title =  dashframe.name;
                        $scope.currentUrl= $sce.trustAsResourceUrl(dashframe.param);                        
			saveBoard();
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
                        },
                        function(isConfirm){  

                                if(isConfirm)
                                {
                                        storeService.delete(id);                                        
                                        $state.go('dashboard', { boardID: 'home' });
                                        eventbus.broadcast(EVENTS.DASHBOARD_CHANGED, id);
                                }
                        });
		};
				
		var saveBoard = function() {

			console.log("RRR");
			   /* create menu */
                        var data = {
                                param: {
                                       id: $scope.dashframe.id, 
                                       protect: false,
                                       title: $scope.dashframe.name,
                                       type: 1,
                                       param: $scope.dashframe.param,
                                       weight: $scope.dashframe.weight,
                                       alias: $scope.dashframe.alias,
                                       icon: ""  
                                }
                        };

			storeService.menu($scope.dashframe.id, data).then(function (status) {
                                //console.log("update");
                        }, function () {
                                //console.log("wrong reply");  
                        })['finally'](function () {
                                //console.log("UPDATE DASH", EVENTS.DASHBOARD_CHANGED);
                                eventbus.broadcast(EVENTS.DASHBOARD_CHANGED, name);
                        });
                };
                  
		$scope.editBoard = function() {
		                //console.log("EDIT", $scope.dashboard);
		                eventbus.broadcast(EVENTS.DASHBOARD_EDIT, $scope.dashframe);
                };
                
                var deregisterApplyNewDashboardSettings = eventbus.subscribe(EVENTS.DASHFRAME_NEW_SETTINGS, function (event, dashboard) {
                        //console.log("NEW", dashboard);
                        applyNewDashFrameChanges(dashboard);
                });                                                                                                

		                                                                                
		
                // cancel interval on scope destroy
                $scope.$on('$destroy', function(){
                      //console.log("destroy old dashframe"); 
                      deregisterApplyNewDashboardSettings();                                            
                });    
		
    };
    
    dashframeController.$inject = injectParams;
export default dashframeController;

