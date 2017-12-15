    var injectParams = ['$scope','$state','$stateParams','$location','$rootScope','eventbus', 'settingsService', '$uibModal','adminService', 'SweetAlert', 'authService'];

    var SettingsAdminAlarmProfileController = function ($scope, $state, $stateParams, $location, $rootScope, eventbus, settingsService, $uibModal, adminService, SweetAlert, authService) {
         
            this.name = $stateParams.paramID;            
	    $scope.isBusy = false;
	    $scope.showtable = true;
	    $scope.dataLoading = false;
	    $scope.rowCollection = [];

            var getAlarmProfileInfo = function(user) {
            
                console.log("GET USER");
                $scope.dataLoading = true;
                adminService.getAlarmProfiles().then(function (data) {
			console.log(data);
			if(data.data)
			{
			      $scope.rowCollection =  data.data;
			      console.log(data.data);
			      $scope.dataLoading = false;
                        }
                        
		}, function () {         
		        $scope.dataLoading = false;
                })['finally'](function () {
                        $scope.dataLoading = false;
                });     
                                                      
            }; 

            getAlarmProfileInfo();                    

            $scope.editAlarmProfile = function(row) {                            
                                        
                    var alarmprofiledata = row;                                        
                    console.log("EDIT IT", alarmprofiledata);
	            var modalInstance = $uibModal.open({
        		        scope: $scope,
		                templateUrl: 'app/views/settings/admin/alarmprofile.edit.tmpl.html',
		                controller: 'SettingsAdminAlarmProfileEditController',
				resolve: {
		                    alarmprofiledata: function() {
                			return alarmprofiledata;
		                    }    
                		}
		     });

	   	     modalInstance.result.then(function(alarmprofiledata) {

	   	         console.log(alarmprofiledata);
                               
                        var alarmprofile = {                    
                            id: alarmprofiledata.id,
                            gid: alarmprofiledata.gid,
                            name: alarmprofiledata.name,
                            type: alarmprofiledata.type,
                            host: alarmprofiledata.host,
                            from: alarmprofiledata.from,
                            to: alarmprofiledata.to,
                            subject: alarmprofiledata.subject,
                            message: alarmprofiledata.message,
                            action: alarmprofiledata.action,
                            description: alarmprofiledata.description,
                            enable: alarmprofiledata.deleted,
                        };                                                            
                               
                               
                        console.log("SAVE IT", alarmprofile);                               
                                                
                        if(alarmprofile.id > 0 )
                        {
                                            
                                adminService.updateAlarmProfile(alarmprofile).then(function (data) {
                                        console.log("updated");                            
                                        row = data.data;                            
                                    }, function () {
                                
                                    })['finally'](function () {
                                        $scope.isBusy = false;
                                });                                                                                  
                         }
                         else {
                         
                                adminService.createAlarmProfile(alarmprofile).then(function (data) {
                                                                        
                                        console.log("add");                            
                                        getAlarmProfileInfo();
                                        
                                    }, function () {
                                
                                    })['finally'](function () {
                                        $scope.isBusy = false;
                                });                              
                         }
		    });
            };        
            
            $scope.deleteAlarmProfile = function(row) {                            
                                        
                        console.log("REMOVE");
                        SweetAlert.swal({
	                        title: "Delete alarmprofile?",
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
					adminService.deleteAlarmProfile(row.id).then(function (data) {
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
            
            
            $scope.addAlarmProfile = function() {                            
                    
                    var tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    
                    var alarmprofile = {                    
                            id: 0,
                            active: true
                    };                             
                    
                    console.log(alarmprofile);                    
                    $scope.editAlarmProfile(alarmprofile);                                        
            };            
    };

    SettingsAdminAlarmProfileController.$inject = injectParams;
export default SettingsAdminAlarmProfileController;
