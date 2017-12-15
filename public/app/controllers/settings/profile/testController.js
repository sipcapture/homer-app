    var injectParams = ['$scope','$state','$stateParams','$location','$rootScope','eventbus', 'settingsService', '$uibModal'];

    var SettingsTestController = function ($scope, $state, $stateParams, $location, $rootScope, eventbus, settingsService, $uibModal) {
         
            this.name = $stateParams.paramID;            

            console.log("AAA-RRR", $stateParams);
            
            this.closeDialog = function() {
            
                console.log("CLOSE IT");
            
            };
            
            if(this.name == "user") {
               var profile = {
                   username: "tester",
                   grp: "user",
                   passsword: "123456",
                   password2: "123456",
                   firstname: "Tester",
                   lastname: "Teserovich",
                   email: "test@test.com",
                   department: "Voice"               
               };
               $scope.profile = profile;
               
               console.log("USER", profile);
            };
                        
            this.saveSettings = function(curentSettings) {
            
                  settings.updateUser(curentSettings).then(function (curentSettings) {
                            console.log("updated");                            
                        }, function () {
                                
                        })['finally'](function () {
                                $scope.isBusy = false;
                        });                  
            };                            
    };

    SettingsTestController.$inject = injectParams;
export default SettingsTestController; 
