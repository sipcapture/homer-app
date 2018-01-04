import app from './app.module';

app.config(function ($urlRouterProvider, $httpProvider, $stateProvider, ROUTER) {
  'ngInject';
  $stateProvider.state('hepic', {
    views: {
      'header': {
        component: 'headerNavbar'
      },
      'main': {
        component: 'mainContent'
      },
      'footer': {
        component: 'footerBar'
      }
    }
  });
  $urlRouterProvider.otherwise(ROUTER.HOME.PATH);
  $httpProvider.interceptors.push('AuthenticationInterceptor');
});

export default app;
