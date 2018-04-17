import angular from 'angular';
import appPreferences from './app-preferences.component';
import appPreferencesEditor from './components/app-preferences-editor';
import PreferencesService from './services/preferences-service';

export default angular.module('hepicApp.appPreferences', [])
  .config(function($stateProvider, ROUTER) {
    'ngInject';

    $stateProvider
      .state(ROUTER.PREFERENCES.NAME, {
        url: ROUTER.PREFERENCES.PATH,
        component: 'appPreferences',
      })
      .state(ROUTER.PREFERENCES_EDITOR.NAME, {
        url: ROUTER.PREFERENCES_EDITOR.PATH,
        component: 'appPreferencesEditor',
        params: {
          sectionName: {
            value: 'users',
            squash: false,
          },
        },
      });
  })
  .factory('PreferencesService', /* @ngInject */ (UserService) => new PreferencesService(UserService))
  .component('appPreferencesEditor', appPreferencesEditor)
  .component('appPreferences', appPreferences);
