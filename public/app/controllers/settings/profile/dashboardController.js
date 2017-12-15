    var injectParams = ['$scope','$state','$stateParams','$location','$rootScope','eventbus', 'settingsService', '$uibModal','authService'];

    var SettingsDashboardController = function ($scope, $state, $stateParams, $location, $rootScope, eventbus, settingsService, $uibModal, authService) {
         
            this.name = $stateParams.paramID;            
	    $scope.isBusy = false;
	    $scope.invalidDashboard = false;

            var getDashboardInfo = function(user) {
            
                console.log("GET USER");
                $scope.profile = {};
                $scope.profile.timezone = "(GMT+02:00) Europe/Amsterdam";
                
                /*
                authService.getDashboard().then(function (data) {
			console.log(data);
			if(data.data)
			{
			      $scope.profile =  data.data;
                        }
                        
			$scope.invalidDashboard = false;
		}, function () {         
			$scope.invalidDashboard = true;
                })['finally'](function () {
                        $scope.isBusy = false;
                });     
                */
                                                      
            }; 

            getDashboardInfo();

            $scope.saveProfile = function() {                            
                                        
                    if($scope.myForm.$dirty && !$scope.myForm.$invalid)
                    {
                    
                        console.log("DIRT", $scope.myForm.$dirty);
                        console.log("RZ", $scope.myForm.$invalid);                    
                        
                        $scope.isBusy = true;
                    
                        var profile = {                    
                            email: $scope.profile.email,
                            firstname: $scope.profile.firstname,
                            lastname: $scope.profile.lastname,
                            department: $scope.profile.department
                        };         
                               
                        console.log("SAVE IT", profile);                               
                                            
                        authService.updateDashboard(profile).then(function (data) {
                            console.log("updated");                            
                            $scope.profile = data.data;                            
                        }, function () {
                                
                        })['finally'](function () {
                                $scope.isBusy = false;
                        });                              
                        
                        if($scope.profile.password && $scope.profile.password.length > 3);
                        {                        
                            profile = {
                                password: $scope.profile.password 
                            };
                            
                            authService.updatePassword(profile).then(function (data) {
                                console.log("updated");                            
                        }, function () {
                                
                        })['finally'](function () {
                                $scope.isBusy = false;
                        });                              
                            
                        }                        
                    }
            };
    };

    SettingsDashboardController.$inject = injectParams;
export default SettingsDashboardController;
