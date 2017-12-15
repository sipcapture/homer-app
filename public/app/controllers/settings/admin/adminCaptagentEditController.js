
    /* EDIT Captagent */
    var injectSettingsAdminCaptagentEditParams = ['$scope','$state','$uibModalInstance','captagentdata'];
    var SettingsAdminCaptagentEditController = function ($scope, $state, $uibModalInstance, captagentdata) {
         
		$scope.captagent = angular.copy(captagentdata);
		
		$scope.passwordNotSet = false;			

		$scope.toggleMin = function() {
			$scope.minDate = $scope.minDate ? null : new Date();
			$scope.maxDate = $scope.maxDate ? null : new Date().setFullYear(2033, 0, 1);
	        };

        	$scope.toggleMin();

		$scope.modelDateP = {};
		      		
        	$scope.dateOptions = {
	            formatYear: "yy",
	            startingDay: 1,
        	    showWeeks: false
	        };

        	$scope.formatDate = "yyyy-MM-dd HH:mm";
        	        
		$scope.openCalendar = function($event, opened) {
			$event.preventDefault();
			$event.stopPropagation();
			$scope.modelDateP[opened] = !$scope.modelDateP[opened];
		};
		
		$scope.dismiss = function() {
			$uibModalInstance.dismiss();
		};

		$scope.remove = function() {
			console.log("DONE REMOVE");
			$uibModalInstance.close();
		};

	        $scope.save = function() {
	        	        
	            if($scope.myForm.$dirty && !$scope.myForm.$invalid) {
			angular.extend(captagentdata, $scope.captagent);
			$uibModalInstance.close(captagentdata);
                    }
		};
    };

    SettingsAdminCaptagentEditController.$inject = injectSettingsAdminCaptagentEditParams;
export default SettingsAdminCaptagentEditController;
