    var injectParams = ['$scope','$state','$stateParams','$location','$rootScope','eventbus', 'settingsService', '$uibModal','adminService', 'SweetAlert', 'authService'];

    var SettingsAdminCaptagentController = function ($scope, $state, $stateParams, $location, $rootScope, eventbus, settingsService, $uibModal, adminService, SweetAlert, authService) {
         
            this.name = $stateParams.paramID;            
	    $scope.isBusy = false;
	    $scope.showtable = true;
	    $scope.dataLoading = false;
	    $scope.rowCollection = [];

            var getCaptagentInfo = function(user) {
            
                console.log("GET USER");
                $scope.dataLoading = true;
                adminService.getCaptagents().then(function (data) {
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

            getCaptagentInfo();                    

            $scope.editCaptagent = function(row) {                            
                                        
                    var captagentdata = row;                                        
                    console.log("EDIT IT", captagentdata);
	            var modalInstance = $uibModal.open({
        		        scope: $scope,
		                templateUrl: 'app/views/settings/admin/captagent.edit.tmpl.html',
		                controller: 'SettingsAdminCaptagentEditController',
				resolve: {
		                    captagentdata: function() {
                			return captagentdata;
		                    }    
                		}
		     });

	   	     modalInstance.result.then(function(captagentdata) {

	   	         console.log(captagentdata);
                               
                        var captagent = {                    
                            id: captagentdata.id,
                            name: captagentdata.name,
                            ip: captagentdata.ip,
                            authkey: captagentdata.authkey,
                            ts_expire: captagentdata.ts_expire,
                            gid: captagentdata.gid,
                            active: captagentdata.active,
                            limit_day: captagentdata.limit_day,
                            limit_month: captagentdata.limit_month,
                            limit_total: captagentdata.limit_total
                        };                                                            
                               
                               
                        console.log("SAVE IT", captagent);                               
                                                
                        if(captagent.id > 0 )
                        {
                                            
                                adminService.updateCaptagent(captagent).then(function (data) {
                                        console.log("updated");                            
                                        row = data.data;                            
                                    }, function () {
                                
                                    })['finally'](function () {
                                        $scope.isBusy = false;
                                });                              
                        
                                console.log("PASS", captagentdata.password);
                        
                                if(captagentdata.hasOwnProperty("password") && captagentdata.password.length > 3)
                                {                        
                                    console.log("SECOND",captagentdata);
                                    captagent = {
                                        gid: captagentdata.gid,
                                        id: captagentdata.id,
                                        password: captagentdata.password 
                                    };
                            
                                    adminService.updatePassword(captagent).then(function (data) {
                                                console.log("updated");                            
                                            }, function () {
                                
                                            })['finally'](function () {
                                                $scope.isBusy = false;
                                     });	                                                          
                                }                        	   	         
                                
                         }
                         else {
                         
                                captagent.password = captagentdata.password;
                                
                                adminService.createCaptagent(captagent).then(function (data) {
                                                                        
                                        console.log("add");                            
                                        getCaptagentInfo();
                                        
                                    }, function () {
                                
                                    })['finally'](function () {
                                        $scope.isBusy = false;
                                });                              
                        
                                console.log("PASS", captagentdata.password);                        
                         }
		    });
            };        
            
            $scope.deleteCaptagent = function(row) {                            
                                        
                        console.log("REMOVE");
                        SweetAlert.swal({
	                        title: "Delete captagent?",
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
					adminService.deleteCaptagent(row.id).then(function (data) {
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
            
            $scope.addCaptagent = function() {                            
                    
                    var captagent = {                    
                            id: 0,
                            name: 'New Agent',
                            ip: '127.0.0.1',
                            authkey: "hep2hep",
                            ts_expire: new Date().setFullYear(2032),
                            gid: authService.user.gid,
                            active: true,
                            limit_day: 0,
                            limit_month: 0,
                            limit_total: 0
                    };                             
                    
                    console.log(captagent);
                    
                    $scope.editCaptagent(captagent);                                        
            };            
    };

    SettingsAdminCaptagentController.$inject = injectParams;
export default SettingsAdminCaptagentController;
