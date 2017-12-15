
    /* EDIT AlarmRecord */
    var injectSettingsAdminAlarmRecordEditParams = ['$scope','$state','adminService','$uibModalInstance','alarmrecorddata'];
    var SettingsAdminAlarmRecordEditController = function ($scope, $state, adminService, $uibModalInstance, alarmrecorddata) {
         
		$scope.alarmrecord = angular.copy(alarmrecorddata);
		$scope.mainKeys = [];
		$scope.secondKeys = [];
		$scope.thirdKeys = [];
		$scope.ArrayAlarmsKey = [];
		$scope.groupIPs = [];

		adminService.getAlarmKeysAll().then(function (data) {
			var mainkeys = {};
			if(data.data)
			{
			    $scope.ArrayAlarmsKey = data.data;
			    angular.forEach($scope.ArrayAlarmsKey, function(row, key) {			            
			            if(!mainkeys.hasOwnProperty(row['main_key']))
			            {
			                mainkeys[row['main_key']] = row['main_description'];
			                var daR = {
			                    id: row['id'],
			                    label: row['main_description'],
			                    value: row['main_key']			                
			                };
			                $scope.mainKeys.push(daR);			                
			            }
			    });
			    
			    $scope.selectMainKey();
			    $scope.selectSecondKey();
                        }                        
                });     
                
                adminService.getGroupIPs().then(function (data) {
			if(data.data)
			{
			    angular.forEach(data.data, function(row, key) {			            
			                var daR = {
			                    id: row['id'],
			                    label: row['name'],
			                    value: row['name']			                
			                };
			                $scope.groupIPs.push(daR);			                                                
			    });
                        }                        
                });     
                
                                
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
		
		$scope.selectMainKey = function() {
		        var secondkeys = {};
		        angular.forEach($scope.ArrayAlarmsKey, function(row, key) {			            
		        
		                    if(alarmrecorddata.main_key == row['main_key']) 
		                    {		        
        			            if(!secondkeys.hasOwnProperty(row['second_key']))
	        		            {
		        	                secondkeys[row['second_key']] = row['second_description'];
			                        var daR = {
			                            id: row['id'],
			                            label: row['second_description'],
        			                    value: row['second_key']			                
	        		                };
	        		                
		        	                $scope.secondKeys.push(daR);			                
			                    }
                                    }
			});
		};
		
		$scope.selectSecondKey = function() {
		        var thirdkeys = {};
		        angular.forEach($scope.ArrayAlarmsKey, function(row, key) {			            
		        
		                    if(alarmrecorddata.second_key == row['second_key']) 
		                    {		        
        			            if(!thirdkeys.hasOwnProperty(row['third_key']))
	        		            {
		        	                thirdkeys[row['third_key']] = row['third_description'];
			                        var daR = {
			                            id: row['id'],
			                            label: row['third_description'],
        			                    value: row['third_key']			                
	        		                };
	        		                
		        	                $scope.thirdKeys.push(daR);			                
			                    }
                                    }
			});
		};
		
		$scope.dismiss = function() {
			$uibModalInstance.dismiss();
		};

		$scope.remove = function() {
			$uibModalInstance.close();
		};

	        $scope.save = function() {
	        
	            if($scope.myForm.$dirty && !$scope.myForm.$invalid) {
			angular.extend(alarmrecorddata, $scope.alarmrecord);
			$uibModalInstance.close(alarmrecorddata);
                    }
		};
    };

    SettingsAdminAlarmRecordEditController.$inject = injectSettingsAdminAlarmRecordEditParams;
export default SettingsAdminAlarmRecordEditController;
