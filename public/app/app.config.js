import app from './app.module';

app.config(['$stateProvider', '$urlRouterProvider', 'routeResolverProvider', '$controllerProvider',
  '$compileProvider', '$filterProvider', '$provide', '$httpProvider',
  'dialogsProvider', 'localStorageServiceProvider','ROUTER', '$translateProvider',
  function ($stateProvider, $urlRouterProvider, routeResolverProvider, $controllerProvider,
    $compileProvider, $filterProvider, $provide, $httpProvider,
    dialogsProvider, localStorageServiceProvider, ROUTER, $translateProvider) {
  
    dialogsProvider.useBackdrop(true);
    dialogsProvider.useEscClose(true);
    dialogsProvider.useCopy(false);
    dialogsProvider.setSize('sm');
  
    localStorageServiceProvider.setPrefix('hepic').setStorageType('localStorage').setNotify(false, false);
    
    app.register = {
      controller: $controllerProvider.register,
      directive: $compileProvider.directive,
      filter: $filterProvider.register,
      factory: $provide.factory,
      service: $provide.service
    };
  
    $translateProvider.useUrlLoader('lang/en.json');
    $translateProvider.preferredLanguage('en');
    
    //$httpProvider.interceptors.push('sessionRecoverer');
  
    const dashframeState = {
      'name': 'dashframe',
      'url': '/dashframe/:boardID',
      'templateUrl': 'app/views/dashframe.html',
      'controller': 'dashframeController',
      'controllerAs': 'dashframe',
      'secure': true
    };
    
    //const loginState = {
    //  'name': 'login',
    //  'url': '/login',
    //  'templateUrl': 'app/views/login.html',
    //  'controller': 'loginController',
    //  'controllerAs': 'login',
    //  'secure':false
    //};
    
    const aboutState = {
      'name': 'about',
      'url': '/about',
      'templateUrl': 'app/views/About.html',
      'controller': 'AboutController',
      'controllerAs': 'About',
      'secure': false
    };
    
    const settingsState = {
      'name': 'settings',
      'abstract': true,
      'url': '/settings',
      'views': {
        '@': {
          'templateUrl':'app/views/settings.tmpl.html'
        },
        'settingsnav@settings': {
          'templateUrl':'app/views/settings-navigation.tmpl.html',
          'controller':'settingsNavController'
        }
      },
      'secure': true
    };
    
    const profileState = {
      'name': 'profile',
      'url': '/profile/:paramID',
      'views': {
        'settingsmain@settings': {}
      },
      'secure': true,
      'resolve': {
        'load': [ '$q', '$rootScope', '$stateParams', null ]
      }
    };
    
    const adminState = {
      'name': 'admin',
      'url': '/admin/:paramID',
      'views': {
        'settingsmain@settings': {}
      },
      'secure': true,
      'resolve': {
        'load': [ '$q', '$rootScope', '$stateParams', null ]
      }
    };
    
    $stateProvider.state(dashframeState);
    //$stateProvider.state(loginState);
    $stateProvider.state(aboutState);
    $stateProvider.state(settingsState);
    $stateProvider.state(profileState);
    $stateProvider.state(adminState);
    $urlRouterProvider.otherwise(ROUTER.HOME.PATH);
  }]);

export default app;
