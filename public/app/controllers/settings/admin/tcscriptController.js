    var injectParams = ['$scope','$state','$stateParams','$location','$rootScope','eventbus', 'settingsService', '$uibModal','adminService', 'SweetAlert', 'authService'];

    var SettingsAdminTCScriptController = function ($scope, $state, $stateParams, $location, $rootScope, eventbus, settingsService, $uibModal, adminService, SweetAlert, authService) {
         
            this.name = $stateParams.paramID;            
	    $scope.isBusy = false;
	    $scope.showtable = true;
	    $scope.dataLoading = false;
	    $scope.rowCollection = [];

	    var langTools = ace.require("ace/ext/language_tools");

            var getTCScriptInfo = function(user) {
            
                console.log("GET USER");
                $scope.dataLoading = true;
                adminService.getTCScript().then(function (data) {
			console.log(data);
			if(data.data)
			{			
			    $scope.code = data.data;
			    $scope.dataLoading = false;
                        }
                        
		}, function () {         
		        $scope.dataLoading = false;
                })['finally'](function () {
                        $scope.dataLoading = false;
                });     
                                                      
            }; 

            getTCScriptInfo();                    

            $scope.load = function(_editor) {
                    _editor.setOptions({
                        enableBasicAutocompletion:true,
                        enableSnippets:true,
                        enableLiveAutocompletion: false
                    });
            };


            $scope.uploadScript = function() {                            
                    
                    console.log("Upload script");

                    var script = {data: $scope.code};

                    adminService.uploadTCScript(script).then(function (data) {
			console.log(data);
			if(data.data)
			{			
			    $scope.code = data.data;
			    $scope.dataLoading = false;
                        }
                        
		}, function () {         
		        $scope.dataLoading = false;
                })['finally'](function () {
                        $scope.dataLoading = false;
                });                                         
            };            
            
            $scope.reloadScript = function() {                            
                    
                    console.log("Reload script");

                    adminService.reloadTCScript().then(function (data) {
			console.log(data);
			if(data.status == "ok")
			{			
			    sweetAlert("Done", data.data.data, "success");			
			}
			else {
			    sweetAlert("Oops...", data.message, "error");
			    console.log("DONE");
    			    $scope.dataLoading = false;
                        }
                        
		}, function () {         
		        $scope.dataLoading = false;
                })['finally'](function () {
                        $scope.dataLoading = false;
                });                                         
            };            
    };

    SettingsAdminTCScriptController.$inject = injectParams;
export default SettingsAdminTCScriptController;
