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
      dashboardsMenu: function(DashboardStorage, $log) {
        'ngInject';

        return DashboardStorage.getAll().catch(function(err) {
          $log.error(['app.config', 'dashboardsMenu'], err);
        });
      },
      globalsettings: function(AdvancedService, log) {
        'ngInject';
        log.initLocation('appPreferences');

        return AdvancedService.getAll().catch(function(err) {
          log.error(err.message);
        });
      },
      users: function(UserService, log) {
        'ngInject';
        log.initLocation('appPreferences');

        return UserService.getAll().catch(function(err) {
          log.error(err.message);
        });
      },
      userSettings: function(UserSettingsService, log) {
        'ngInject';
        log.initLocation('appPreferences');

        return UserSettingsService.getAll().catch(function(err) {
          log.error(err.message);
        });
      },
      aliases: function(AliasService, log) {
        'ngInject';
        log.initLocation('appPreferences');

        return AliasService.getAll().catch(function(err) {
          log.error(err.message);
        });
      },
      mappings: function(MappingService, log) {
        'ngInject';
        log.initLocation('appPreferences');

        return MappingService.getAll().catch(function(err) {
          log.error(err.message);
        });
      },
    },
  });

  $urlRouterProvider.otherwise(ROUTER.HOME.PATH); // default route
  $httpProvider.interceptors.push('RequestResponseInterceptor'); // intercepts every response error - e.g., 'unauthorized'
});

export default app;
