import app from './app.module';

import englishLanguage from '../lang/en';

app.config(function($urlRouterProvider, $httpProvider, $stateProvider, $translateProvider, ROUTER) {
  'ngInject';
  
  // localization
  $translateProvider.translations('en', englishLanguage);
  $translateProvider.preferredLanguage('en');
  // escapes HTML in the translation, see https://angular-translate.github.io/docs/#/guide/19_security
  $translateProvider.useSanitizeValueStrategy('escape');

  // default states
  $stateProvider.state('hepic', {
    views: {
      'header': {
        component: 'headerNavbar',
      },
      'main': {
        component: 'mainContent',
      },
      'footer': {
        component: 'footerBar',
      },
    },
    resolve: {
      dashboardsMenu: function($log, DashboardStorage) {
        return DashboardStorage.getAll().catch(function(err) {
          $log.error(['headerNavbar state'], ['resolve dashboards'], err);
        });
      },
    },
  });

  $urlRouterProvider.otherwise(ROUTER.HOME.PATH); // default route
  $httpProvider.interceptors.push('RequestResponseInterceptor'); // intercepts every response error - e.g., 'unauthorized'
});

export default app;
