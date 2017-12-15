    var injectParams = ['$scope','$state','$stateParams','$location','$rootScope','eventbus', 'settingsService', '$uibModal','adminService', 'SweetAlert', 'authService'];

    var SettingsAdminAccountsController = function ($scope, $state, $stateParams, $location, $rootScope, eventbus, settingsService, $uibModal, adminService, SweetAlert, authService) {
         
            this.name = $stateParams.paramID;            
	    $scope.isBusy = false;
	    $scope.showtable = true;
	    $scope.dataLoading = false;
	    $scope.rowCollection = [];

            var getAccountsInfo = function(user) {
            
                console.log("GET USER");
                $scope.dataLoading = true;
                adminService.getUsers().then(function (data) {
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

            getAccountsInfo();                    

            $scope.editUser = function(row) {                            
                                        
                    var userdata = row;                                        
                    console.log("EDIT IT", userdata);
	            var modalInstance = $uibModal.open({
        		        scope: $scope,
		                templateUrl: 'app/views/settings/admin/accounts.edit.tmpl.html',
		                controller: 'SettingsAdminAccountsEditController',
				resolve: {
		                    userdata: function() {
                			return userdata;
		                    }    
                		}
		     });

	   	     modalInstance.result.then(function(userdata) {

	   	         console.log(userdata);
 
                         var profile = {                    
                            email: userdata.email,
                            firstname: userdata.firstname,
                            group: userdata.group,
                            gid: userdata.gid,
                            uuid: userdata.uuid,
                            username: userdata.username,
                            lastname: userdata.lastname,
                            department: userdata.department
                        };         
                               
                        console.log("SAVE IT", profile);                               
                                                
                        if(profile.uuid > 0 )
                        {
                                            
                                adminService.updateUser(profile).then(function (data) {
                                        console.log("updated");                            
                                        row = data.data;                            
                                    }, function () {
                                
                                    })['finally'](function () {
                                        $scope.isBusy = false;
                                });                              
                        
                                console.log("PASS", userdata.password);
                        
                                if(userdata.hasOwnProperty("password") && userdata.password.length > 3)
                                {                        
                                    console.log("SECOND",userdata);
                                    profile = {
                                        gid: userdata.gid,
                                        uuid: userdata.uuid,
                                        password: userdata.password 
                                    };
                            
                                    adminService.updatePassword(profile).then(function (data) {
                                                console.log("updated");                            
                                            }, function () {
                                
                                            })['finally'](function () {
                                                $scope.isBusy = false;
                                     });	                                                          
                                }                        	   	         
                                
                         }
                         else {
                         
                                profile.password = userdata.password;
                                
                                adminService.createUser(profile).then(function (data) {
                                                                        
                                        console.log("add");                            
                                        getAccountsInfo();
                                        
                                    }, function () {
                                
                                    })['finally'](function () {
                                        $scope.isBusy = false;
                                });                              
                        
                                console.log("PASS", userdata.password);                        
                         }
		    });
            };        
            
            $scope.deleteUser = function(row) {                            
                                        
                        console.log("REMOVE");
                        SweetAlert.swal({
	                        title: "Delete user?",
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
					adminService.deleteUser(row.uuid).then(function (data) {
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
            
            $scope.addUser = function() {                            
                    
                    var profile = {                    
                            uuid: 0,
                            firstname: 'Firstname',
                            group: 'user',
                            password: '',
                            email: 'email@test.com',
                            gid: authService.user.gid,
                            username: 'login',
                            lastname: 'Lastname',
                            department: 'Voice Department'
                    };                             
                    
                    console.log(profile);
                    
                    $scope.editUser(profile);                                        
            };            
    };

    SettingsAdminAccountsController.$inject = injectParams;
export default SettingsAdminAccountsController;
