
    /* EDIT User */
    var injectSettingsAdminAccountsEditParams = ['$scope','$state','$uibModalInstance','userdata'];
    var SettingsAdminAccountsEditController = function ($scope, $state, $uibModalInstance, userdata) {
         
		$scope.profile = angular.copy(userdata);
		$scope.passwordNotSet = false;
		
		$scope.dismiss = function() {
			$uibModalInstance.dismiss();
		};

		$scope.remove = function() {
			console.log("DONE REMOVE");
			$uibModalInstance.close();
		};

	        $scope.save = function() {

	            if(userdata.uuid == 0 && $scope.profile.password.length < 3) {
	                $scope.passwordNotSet = true;
	                $scope.myForm.$invalid = true;
	            }
	        	        
	            if($scope.myForm.$dirty && !$scope.myForm.$invalid) {
			angular.extend(userdata, $scope.profile);
			$uibModalInstance.close(userdata);
                    }
		};
    };

    SettingsAdminAccountsEditController.$inject = injectSettingsAdminAccountsEditParams;
export default SettingsAdminAccountsEditController;
