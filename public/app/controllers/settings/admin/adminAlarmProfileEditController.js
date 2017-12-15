
    /* EDIT AlarmProfile */
    var injectSettingsAdminAlarmProfileEditParams = ['$scope','$state','$uibModalInstance','alarmprofiledata'];
    var SettingsAdminAlarmProfileEditController = function ($scope, $state, $uibModalInstance, alarmprofiledata) {
         
		$scope.alarmprofile = angular.copy(alarmprofiledata);
		
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

		$scope.alarmTypes = [
			{
                        	id: 1,
                                label: 'EMAIL',
                                value: 'email'
                        },{
                        	id: 2,
                                label: 'SNMP',
                                value: 'snmp'
                        },{
                        	id: 3,
                                label: 'HTTP',
                                value: 'http'
                        }
		];

		$scope.alarmActions = [
			{
                        	id: 1,
                                label: 'POST',
                                value: 'post',
                        },{
                        	id: 2,
                                label: 'GET',
                                value: 'get'
                        }
		];

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
			$uibModalInstance.close();
		};

	        $scope.save = function() {
	        	        
	            if($scope.myForm.$dirty && !$scope.myForm.$invalid) {
			angular.extend(alarmprofiledata, $scope.alarmprofile);
			$uibModalInstance.close(alarmprofiledata);
                    }
		};
    };

    SettingsAdminAlarmProfileEditController.$inject = injectSettingsAdminAlarmProfileEditParams;
export default SettingsAdminAlarmProfileEditController;
