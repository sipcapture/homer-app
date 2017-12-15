    var injectParams = ['$scope','$state','$stateParams','$location','$rootScope','eventbus', 'settingsService', '$uibModal','adminService', 'SweetAlert', 'authService'];

    var SettingsAdminGroupIPController = function ($scope, $state, $stateParams, $location, $rootScope, eventbus, settingsService, $uibModal, adminService, SweetAlert, authService) {
         
            this.name = $stateParams.paramID;            
	    $scope.isBusy = false;
	    $scope.showtable = true;
	    $scope.dataLoading = false;
	    $scope.rowCollection = [];

            var getGroupIPInfo = function(user) {
            
                console.log("GET USER");
                $scope.dataLoading = true;
                adminService.getGroupIPs().then(function (data) {
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

            getGroupIPInfo();                    

            $scope.editGroupIP = function(row) {                            
                                        
                    var groupipdata = row;                                        
                    console.log("EDIT IT", groupipdata);
	            var modalInstance = $uibModal.open({
        		        scope: $scope,
		                templateUrl: 'app/views/settings/admin/groupip.edit.tmpl.html',
		                controller: 'SettingsAdminGroupIPEditController',
				resolve: {
		                    groupipdata: function() {
                			return groupipdata;
		                    }    
                		}
		     });

	   	     modalInstance.result.then(function(groupipdata) {

	   	         console.log(groupipdata);
                               
                        var groupip = {                    
                            id: groupipdata.id,
                            name: groupipdata.name,
                            ip: groupipdata.ip,
                            bits: groupipdata.bits,
                            port: groupipdata.port,
                            gid: groupipdata.gid,
                            active: groupipdata.active
                        };                                                            
                                                              
                        console.log("SAVE IT", groupip);                               
                                                
                        if(groupip.id > 0 )
                        {
                                            
                                adminService.updateGroupIP(groupip).then(function (data) {
                                        console.log("updated");                            
                                        row = data.data;                            
                                    }, function () {
                                
                                    })['finally'](function () {
                                        $scope.isBusy = false;
                                });                                                                                      
                         }
                         else {
                         
                                adminService.createGroupIP(groupip).then(function (data) {
                                                                        
                                        console.log("add");                            
                                        getGroupIPInfo();
                                        
                                    }, function () {
                                
                                    })['finally'](function () {
                                        $scope.isBusy = false;
                                });                                                      
                         }
		    });
            };        
            
            $scope.deleteGroupIP = function(row) {                            
                                        
                        console.log("REMOVE");
                        SweetAlert.swal({
	                        title: "Delete groupip?",
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
					adminService.deleteGroupIP(row.id).then(function (data) {
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
            
            $scope.addGroupIP = function() {                            
                    
                    var groupip = {                    
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
                    
                    console.log(groupip);
                    
                    $scope.editGroupIP(groupip);                                        
            };            
    };

    SettingsAdminGroupIPController.$inject = injectParams;
export default SettingsAdminGroupIPController;
