import app from './app.module';

app.run(['$rootScope', '$location', 'authService', '$state','userProfile',
  function ($rootScope, $location, authService, $state) {

    $rootScope.loggedIn = true;
    authService.session().then(function (status) {
      doSubscribe();
                              
      if (status.isAuthenticated) {
        if (status.isAuthenticated == false) {
          $rootScope.loggedIn = false;
          $state.go('login');
        } else {
          $rootScope.loggedIn = true;
          /* get user profile */
          var path = $location.path();
          if (path == '/login' || path == '/logout') $state.go('dashboard', { boardID: 'home' });
        }
      }
    }, function (error) {
      console.log('[error]', '[security]', error);
      $rootScope.loggedIn = false;
      $state.go('login');
    });
              
    function doSubscribe() {
      $rootScope.$on('$stateChangeStart', function(event, toState){
        if (toState && toState.secure) {
          console.log('[info]', '[security]', authService.user.isAuthenticated);
          if (!authService.user.isAuthenticated) {
            event.preventDefault();
            return $state.go('login');
          }
        }
      });
    }
  }
]);
