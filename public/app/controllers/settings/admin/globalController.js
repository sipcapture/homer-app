    var injectParams = ['$scope','$state','$stateParams','$location','$rootScope','eventbus', 'settingsService', '$uibModal','adminService'];

    var SettingsGlobalAdminController = function ($scope, $state, $stateParams, $location, $rootScope, eventbus, settingsService, $uibModal, adminService) {
         
            this.name = $stateParams.paramID;            
	    $scope.isBusy = false;
	    $scope.invalidGlobal = false;	    
	    $scope.profile = {};
	    
	    $scope.profile.recording = true;

            var getGlobalInfo = function(user) {
            
                console.log("GET USER");
                
                adminService.getRemoteProfile("dashboard").then(function (data) {
			console.log(data);
			$scope.profile =  data["dashboard"];                                                
			$scope.invalidGlobal = false;
		}, function () {         
			$scope.invalidGlobal = true;
                })['finally'](function () {
                        $scope.isBusy = false;
                });                 
                                                      
            }; 

            getGlobalInfo();

            $scope.saveProfile = function() {                            
                                        
                    console.log("save");
                    $scope.isBusy = true;

                    console.log($scope.profile);
                    
                    /* update RTP LOOKUP */                                      
                                                                 
                    adminService.setRemoteProfile("dashboard", $scope.profile).then(function (data) {
                            console.log("updated");                            
                        }, function () {
                                
                        })['finally'](function () {
                                $scope.isBusy = false;
                    });                                                                          
            };
    };

    SettingsGlobalAdminController.$inject = injectParams;
export default SettingsGlobalAdminController;
