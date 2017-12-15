    var injectParams = ['$scope', '$state', 'authService','$rootScope','$uibModal', 'userProfile'];
                                           
    var LoginController = function ($scope,$state, authService, $rootScope, $uibModal, userProfile) {

        var  path = '/';

        $scope.errorMessage = null;

        $scope.loginModel = {
                username: null,
                password: null,
                auth_type: null        
        };
                
        $scope.isBusy = false;
        $scope.invalidLogin = false;
        $rootScope.loggedIn = true;
        
        console.log("LOGIn!!!!!!!!!!!", authService.user.isAuthenticated);
        
        if(authService.user.isAuthenticated)
        {
                console.log("go out from here");
                $rootScope.loggedIn = true;
                userProfile.getAll();
                userProfile.getAllServerRemoteProfile();
                $state.go('dashboard', { boardID: 'home' });                                
        }
        
        $rootScope.loggedIn = false;

        $scope.loginSubmit = function () {
        
            console.log('Submiting user info.');
            
	    $scope.invalidLogin = false;
            $scope.isBusy = true;
            
            authService.login($scope.loginModel.username, $scope.loginModel.password, $scope.loginModel.auth_type).then(function (status) {
                $scope.isBusy = false;                                                            
                if(status.isAuthenticated == true) {
                        $rootScope.loggedIn = true;
                        /* retrive our profile */
                        //console.log(userProfile);
                        userProfile.getAll();
                        userProfile.getAllServerRemoteProfile();
                        $state.go('dashboard', { boardID: 'home' });
                }
                else {
                        $scope.invalidLogin = true;
                }                    
            }, function () {
                        $scope.invalidLogin = true;
                })['finally'](function () {
                        $scope.isBusy = false;
                });	                    	                                
        };
        
        $scope.logout = function () {
                $rootScope.loggedIn = false;            
                authService.logout().then(function (status) {            
                    $state.go('login');
                },
                function () {
                    $state.go('login');
                });
        };
    };

    LoginController.$inject = injectParams;
export default LoginController;
