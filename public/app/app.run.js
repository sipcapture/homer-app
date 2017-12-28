import app from './app.module';

app.run(function($rootScope, $http, $location, $localStorage, $state, ROUTER) {
  'ngInject';
  if ($localStorage.user) {
    $http.defaults.headers.common.Authorization = `Bearer ${$localStorage.user.token}`;
    $rootScope.authenticated = true;
  }
	
  $rootScope.$on('$locationChangeStart', function() {
    var publicPages = [ROUTER.LOGIN.PATH];
    var restrictedPage = publicPages.indexOf($location.path()) === -1;
    if (restrictedPage && !$localStorage.user) {
      $state.go(ROUTER.LOGIN.NAME);
    }
  });
});

//app.run(['$rootScope', '$location', 'authService', '$state','userProfile',
//  function ($rootScope, $location, authService, $state) {
//
//    $rootScope.loggedIn = true;
//    authService.session().then(function (status) {
//      doSubscribe();
//      if (status.isAuthenticated) {
//        if (status.isAuthenticated == false) {
//          $rootScope.loggedIn = false;
//          $state.go('login');
//        } else {
//          $rootScope.loggedIn = true;
//          /* get user profile */
//          var path = $location.path();
//          if (path == '/login' || path == '/logout') $state.go('dashboard', { boardID: 'home' });
//        }
//      }
//    }, function (error) {
//      console.log('[error]', '[security]', error);
//      $rootScope.loggedIn = false;
//      $state.go('login');
//    });
//    function doSubscribe() {
//      $rootScope.$on('$stateChangeStart', function(event, toState){
//        if (toState && toState.secure) {
//          console.log('[info]', '[security]', authService.user.isAuthenticated);
//          if (!authService.user.isAuthenticated) {
//            event.preventDefault();
//            return $state.go('login');
//          }
//        }
//      });
//    }
//  }
//]);
