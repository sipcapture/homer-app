    var injectParams = ['$scope','$state','$stateParams','$location','$rootScope','eventbus', 'settingsService', '$uibModal','adminService', 'SweetAlert', 'authService'];

    var SettingsAdminInterceptionController = function ($scope, $state, $stateParams, $location, $rootScope, eventbus, settingsService, $uibModal, adminService, SweetAlert, authService) {
         
            this.name = $stateParams.paramID;            
	    $scope.isBusy = false;
	    $scope.showtable = true;
	    $scope.dataLoading = false;
	    $scope.rowCollection = [];

            var getInterceptionInfo = function(user) {
            
                console.log("GET USER");
                $scope.dataLoading = true;
                adminService.getInterceptions().then(function (data) {
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

            getInterceptionInfo();                    

            $scope.editInterception = function(row) {                            
                                        
                    var interceptiondata = row;                                        
                    console.log("EDIT IT", interceptiondata);
	            var modalInstance = $uibModal.open({
        		        scope: $scope,
		                templateUrl: 'app/views/settings/admin/interception.edit.tmpl.html',
		                controller: 'SettingsAdminInterceptionEditController',
				resolve: {
		                    interceptiondata: function() {
                			return interceptiondata;
		                    }    
                		}
		     });

	   	     modalInstance.result.then(function(interceptiondata) {

	   	         console.log(interceptiondata);
                               
                        var interception = {                    
                            id: interceptiondata.id,
                            gid: interceptiondata.gid,
                            LIID: interceptiondata.LIID,
                            search_callee: interceptiondata.search_callee,
                            search_caller: interceptiondata.search_caller,
                            search_ip: interceptiondata.search_ip,
                            number: interceptiondata.number,
                            description: interceptiondata.description,
                            ts_start: interceptiondata.ts_start,
                            ts_stop: interceptiondata.ts_stop,
                            deleted: interceptiondata.deleted,
                        };                                                            

                        if(interceptiondata.ts_start instanceof Date) {
                            interception.ts_start = interceptiondata.ts_start.getTime();                        
                        }
                        
                        if(interceptiondata.ts_stop instanceof Date) {
                            interception.ts_stop =  interceptiondata.ts_stop.getTime();                        
                        }
                               
                               
                        console.log("SAVE IT", interception);                               
                                                
                        if(interception.id > 0 )
                        {
                                            
                                adminService.updateInterception(interception).then(function (data) {
                                        console.log("updated");                            
                                        row = data.data;                            
                                    }, function () {
                                
                                    })['finally'](function () {
                                        $scope.isBusy = false;
                                });                              
                        
                         }
                         else {
                         
                                adminService.createInterception(interception).then(function (data) {
                                                                        
                                        console.log("add");                            
                                        getInterceptionInfo();
                                        
                                    }, function () {
                                
                                    })['finally'](function () {
                                        $scope.isBusy = false;
                                });                                                      
                         }
		    });
            };        
            
            $scope.deleteInterception = function(row) {                            
                                        
                        console.log("REMOVE");
                        SweetAlert.swal({
	                        title: "Delete interception?",
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
					adminService.deleteInterception(row.id).then(function (data) {
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
            
            
            $scope.addInterception = function() {                            
                    
                    var tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    
                    var interception = {                    
                            id: 0,
                            ts_start: new Date().getTime(),
                            ts_stop: tomorrow.getTime(),
                            gid: authService.user.gid,
                            active: true
                    };                             
                    
                    console.log(interception);                    
                    $scope.editInterception(interception);                                        
            };            
    };

    SettingsAdminInterceptionController.$inject = injectParams;
export default SettingsAdminInterceptionController;
