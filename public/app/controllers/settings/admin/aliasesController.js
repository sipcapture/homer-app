    var injectParams = ['$scope','$state','$stateParams','$location','$rootScope','eventbus', 'settingsService', '$uibModal','adminService', 'SweetAlert', 'authService'];

    var SettingsAdminAliasesController = function ($scope, $state, $stateParams, $location, $rootScope, eventbus, settingsService, $uibModal, adminService, SweetAlert, authService) {
         
            this.name = $stateParams.paramID;            
	    $scope.isBusy = false;
	    $scope.showtable = true;
	    $scope.dataLoading = false;
	    $scope.rowCollection = [];

            var getAliasesInfo = function(user) {
            
                console.log("GET USER");
                $scope.dataLoading = true;
                adminService.getAliases().then(function (data) {
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

            getAliasesInfo();                    

            $scope.editAlias = function(row) {                            
                                        
                    var aliasesdata = row;                                        
                    console.log("EDIT IT", aliasesdata);
	            var modalInstance = $uibModal.open({
        		        scope: $scope,
		                templateUrl: 'app/views/settings/admin/aliases.edit.tmpl.html',
		                controller: 'SettingsAdminAliasesEditController',
				resolve: {
		                    aliasesdata: function() {
                			return aliasesdata;
		                    }    
                		}
		     });

	   	     modalInstance.result.then(function(aliasesdata) {

	   	         console.log(aliasesdata);
                               
                        var aliases = {                    
                            id: aliasesdata.id,
                            ip: aliasesdata.ip,
                            port: aliasesdata.port,
                            created: aliasesdata.created,
                            gid: aliasesdata.gid,
                            status: aliasesdata.status,
                            alias: aliasesdata.alias
                        };                                                            
                               
                               
                        console.log("SAVE IT", aliases);                               
                                                
                        if(aliases.id > 0 )
                        {
                                            
                                adminService.updateAlias(aliases).then(function (data) {
                                        console.log("updated");                            
                                        row = data.data;                            
                                    }, function () {
                                
                                    })['finally'](function () {
                                        $scope.isBusy = false;
                                });                                                      
                                
                         }
                         else {
                         
                                adminService.createAlias(aliases).then(function (data) {
                                                                        
                                        console.log("add");                            
                                        getAliasesInfo();
                                        
                                    }, function () {
                                
                                    })['finally'](function () {
                                        $scope.isBusy = false;
                                });                                                      
                         }
		    });
            };        
            
            $scope.deleteAlias = function(row) {                            
                                        
                        console.log("REMOVE");
                        SweetAlert.swal({
	                        title: "Delete alias?",
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
					adminService.deleteAlias(row.id).then(function (data) {
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
            
            $scope.addAlias = function() {                            
                    
                    var aliases = {                    
                            id: 0,
                            alias: 'New Alias',
                            ip: '127.0.0.1',
                            authkey: "hep2hep",
                            created: new Date().getTime(),
                            gid: authService.user.gid,
                            status: true,
                            port: 0
                    };                             
                    
                    console.log(aliases);
                    
                    $scope.editAlias(aliases);                                        
            };            
    };

    SettingsAdminAliasesController.$inject = injectParams;
export default SettingsAdminAliasesController;
