    var injectParams = ['$scope','$state','$stateParams','$location','$rootScope','eventbus', 'settingsService', '$uibModal','adminService', 'SweetAlert', 'authService'];

    var SettingsAdminAlarmRecordController = function ($scope, $state, $stateParams, $location, $rootScope, eventbus, settingsService, $uibModal, adminService, SweetAlert, authService) {
         
            this.name = $stateParams.paramID;            
	    $scope.isBusy = false;
	    $scope.showtable = true;
	    $scope.dataLoading = false;
	    $scope.rowCollection = [];

            var getAlarmRecordInfo = function(user) {
            
                $scope.dataLoading = true;
                adminService.getAlarmRecords().then(function (data) {
			if(data.data)
			{
			      $scope.rowCollection =  data.data;
			      $scope.dataLoading = false;
                        }
                        
		}, function () {         
		        $scope.dataLoading = false;
                })['finally'](function () {
                        $scope.dataLoading = false;
                });     
                
                                                      
            }; 

            getAlarmRecordInfo();                    

            $scope.editAlarmRecord = function(row) {                            
                                        
                    var alarmrecorddata = row;                                        
	            var modalInstance = $uibModal.open({
        		        scope: $scope,
		                templateUrl: 'app/views/settings/admin/alarmrecord.edit.tmpl.html',
		                controller: 'SettingsAdminAlarmRecordEditController',
				resolve: {
		                    alarmrecorddata: function() {
                			return alarmrecorddata;
		                    }    
                		}
		     });

	   	     modalInstance.result.then(function(alarmrecorddata) {
                               
                        var alarmrecord = {                    
                            id: alarmrecorddata.id,
                            gid: alarmrecorddata.gid,
                            name: alarmrecorddata.name,
                            main_key: alarmrecorddata.main_key,
                            second_key: alarmrecorddata.second_key,
                            third_key: alarmrecorddata.third_key,
                            host_group: alarmrecorddata.host_group,
                            math: alarmrecorddata.math,
                            value: alarmrecorddata.value,
                            description: alarmrecorddata.description,
                            ts_start: alarmrecorddata.ts_start,
                            ts_stop: alarmrecorddata.ts_stop,
                            enable: alarmrecorddata.enable,
                        };                                                            
                               
                               
                        if(alarmrecord.id > 0 )
                        {
                                            
                                adminService.updateAlarmRecord(alarmrecord).then(function (data) {
                                        row = data.data;                            
                                    }, function () {
                                
                                    })['finally'](function () {
                                        $scope.isBusy = false;
                                });                              
                        
                                console.log("PASS", alarmrecorddata.password);                                                        
                         }
                         else {
                         
                                alarmrecord.password = alarmrecorddata.password;
                                
                                adminService.createAlarmRecord(alarmrecord).then(function (data) {
                                                                        
                                        console.log("add");                            
                                        getAlarmRecordInfo();
                                        
                                    }, function () {
                                
                                    })['finally'](function () {
                                        $scope.isBusy = false;
                                });                                                      
                         }
		    });
            };        
            
            $scope.deleteAlarmRecord = function(row) {                            
                                        
                        console.log("REMOVE");
                        SweetAlert.swal({
	                        title: "Delete alarmrecord?",
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
					adminService.deleteAlarmRecord(row.id).then(function (data) {
	                	                        console.log("deleted");                            
							var index = $scope.rowCollection.indexOf(row);
							if (index !== -1) {$scope.rowCollection.splice(index, 1); }
        		                        }, function () {				                                

		                                })['finally'](function () {
                		                        $scope.isBusy = false;
					});                             					
				   } 
	                        }
			);
            };            
            
            
            $scope.addAlarmRecord = function() {                            
                    
                    var tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    
                    var alarmrecord = {                    
                            id: 0,
                            ts_start: new Date().getTime(),
                            ts_stop: tomorrow.getTime(),
                            gid: authService.user.gid,
                            active: true
                    };                             
                    
                    console.log(alarmrecord);                    
                    $scope.editAlarmRecord(alarmrecord);                                        
            };            
    };

    SettingsAdminAlarmRecordController.$inject = injectParams;
export default SettingsAdminAlarmRecordController;
