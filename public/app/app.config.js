import app from './app.module';

import english_language from '../lang/en';

app.config(function ($urlRouterProvider, $httpProvider, $stateProvider, $translateProvider, ROUTER) {
  'ngInject';
  
  // localization
  $translateProvider.translations('en', english_language);
  $translateProvider.preferredLanguage('en');
  // escapes HTML in the translation, see https://angular-translate.github.io/docs/#/guide/19_security
  $translateProvider.useSanitizeValueStrategy('escape');

  // default states
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

  $urlRouterProvider.otherwise(ROUTER.HOME.PATH); // default route
  $httpProvider.interceptors.push('AuthenticationInterceptor'); // intercepts every response error - e.g., 'unauthorized'
});

export default app;
