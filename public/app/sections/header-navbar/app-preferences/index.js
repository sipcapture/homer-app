import angular from 'angular';
import appPreferences from './app-preferences.component';
import appPreferencesUsers from './components/app-preferences-users';
import appPreferencesUsersAddEditUser from './components/app-preferences-users/components/app-preferences-users-add-edit-user';
import appPreferencesUserSettings from './components/app-preferences-user-settings';
import appPreferencesUserSettingsAddEdit from './components/app-preferences-user-settings/components/app-preferences-user-settings-add-edit';

export default angular.module('hepicApp.appPreferences', [])
  .config(function($stateProvider, ROUTER) {
    'ngInject';

    $stateProvider
      .state(ROUTER.PREFERENCES.NAME, {
        url: ROUTER.PREFERENCES.PATH,
        component: 'appPreferences',
      })
      .state(ROUTER.PREFERENCES_USERS.NAME, {
        url: ROUTER.PREFERENCES_USERS.PATH,
        component: 'appPreferencesUsers',
        resolve: {
          users: function(UserService, log) {
            'ngInject';
            log.initLocation('appPreferences');

            return UserService.getAll().catch(function(err) {
              log.error(err.message);
            });
          },
        },
      })
      .state(ROUTER.PREFERENCES_USER_SETTINGS.NAME, {
        url: ROUTER.PREFERENCES_USER_SETTINGS.PATH,
        component: 'appPreferencesUserSettings',
        resolve: {
          userSettings: function(UserSettingsService, log) {
            'ngInject';
            log.initLocation('appPreferences');

            return UserSettingsService.getAll().catch(function(err) {
              log.error(err.message);
            });
          },
        },
      });
  })
  .component('appPreferencesUsers', appPreferencesUsers)
  .component('appPreferencesUsersAddEditUser', appPreferencesUsersAddEditUser)
  .component('appPreferencesUserSettings', appPreferencesUserSettings)
  .component('appPreferencesUserSettingsAddEdit', appPreferencesUserSettingsAddEdit)
  .component('appPreferences', appPreferences);
