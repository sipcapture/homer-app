    var injectParams = ['$scope', '$state', '$stateParams', '$location','$rootScope','eventbus', 'settingsService', '$uibModal', 'authService'];                                           

    var SettingsNavController = function ($scope, $state, $stateParams, $location, $rootScope, eventbus, settings, $uibModal, authService) {

            this.name = $stateParams.boardID;            
            var that = this;
            
            
            var settingsUserList = [
                    {name:"User", param:"user"},
                  /*  {name:"Dashboard", param:"dashboard"}, */
                    {name:"About", param:"about"}
            ];
            
            var settingsAdminList = [
                    {name:"Global", param:"global"},
                    {name:"Accounts", param:"accounts"},
                    {name:"Agents", param:"captagent"},
                    {name:"Interceptions", param:"interception"},
                    {name:"Alarm Records", param:"alarmrecord"},
                    {name:"Alarm Profiles", param:"alarmprofile"},
                    //{name:"DB Nodes", param:"dbnodes"},
                    {name:"Aliases", param:"aliases"},
                    {name:"IP Groups", param:"groupip"},
                    {name:"TC Script", param:"tcscript"},
                    {name:"NC Script", param:"ncscript"},
                    {name:"System Info", param:"system"}
            ];
                                  
            $scope.settingsUserList = settingsUserList;
            $scope.settingsAdminList = settingsAdminList;
            

	    /* Check if Admin */
	    var currentUser = authService.getCurrentLoginUser();
            $scope.settingsIsAdmin = false;
            if ( currentUser.permissions && (currentUser.permissions.indexOf("admins") > -1 || currentUser.permissions.indexOf("superadmin") > -1 )) $scope.settingsIsAdmin = true;

            //console.log("AR", settingsList);
                                                            
            this.editSettings = function() {

		 var editSettingsScope = $scope.$new();

                 editSettingsScope.profile = {};

	         var instance = $uibModal.open({
        	    scope: editSettingsScope,   
	            templateUrl: 'templates/dialogs/settings-edit.html',
        	    backdrop: 'static',
	            windowClass: 'center-modal'
        	  });        	  
        	  
	         editSettingsScope.saveSettings = function(){
        	    that.saveSettings(editSettingsScope.profile);
        	    instance.close();
        	    editSettingsScope.$destroy();        	                         
	         };
        	 
        	 editSettingsScope.closeDialog = function(){
        	 
                    console.log(editSettingsScope);
        	    instance.close();
	            editSettingsScope.$destroy();
        	 };
            };
            
            this.saveSettings = function(curentSettings) {
            
                  settings.updateUser(curentSettings).then(function (curentSettings) {
                            console.log("updated");                            
                        }, function () {
                                
                        })['finally'](function () {
                                $scope.isBusy = false;
                        });                  
            };

            /*            
            
            eventbus.subscribe("showSettings", function(event,name, model) {
	    	    
	    	        console.log("AAA");
	    	        $state.go('settings', { paramID: 'user' });
	    	        
	    	        $location.path('/settings/user');
	    	                                	    	        
			settings.settingsGetUserTmp().then(function (user) {
                                if(user.auth == true) {
  				    that.editSettings();
                                }
                                else {
                                    console.log("Settings ");
                                }
                        }, function () {
                                
                        })['finally'](function () {
                                $scope.isBusy = false;
                        });                        

            });
            */
            
            $scope.setActive = function (evt) {
                angular.element(".cng-setting__nav-link.active").removeClass('active');
                angular.element(evt.target).addClass('active');
            }


    };

    SettingsNavController.$inject = injectParams;

export default SettingsNavController;
