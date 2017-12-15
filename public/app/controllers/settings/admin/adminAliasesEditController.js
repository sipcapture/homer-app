
    /* EDIT Aliases */
    var injectSettingsAdminAliasesEditParams = ['$scope','$state','$uibModalInstance','aliasesdata'];
    var SettingsAdminAliasesEditController = function ($scope, $state, $uibModalInstance, aliasesdata) {
         
		$scope.aliases = angular.copy(aliasesdata);
		
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
			angular.extend(aliasesdata, $scope.aliases);
			$uibModalInstance.close(aliasesdata);
                    }
		};
    };

    SettingsAdminAliasesEditController.$inject = injectSettingsAdminAliasesEditParams;
export default SettingsAdminAliasesEditController;
