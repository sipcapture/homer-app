// import {cloneDeep, isEmpty} from 'lodash';

class AppPreferences {
  constructor($state, $scope, UserService, ROUTER, log) {
    'ngInject';
    this.$state = $state;
    this.$scope = $scope;
    this.UserService = UserService;
    this.ROUTER = ROUTER;
    this.log = log;
    this.log.initLocation('AppPreferences');

    this.leftMenu = {
      selectedIndex: 0,
      sections: [
        {
          name: ROUTER.PREFERENCES_USERS.CHILDNAME,
          path: ROUTER.PREFERENCES_USERS.CHILDPATH,
        },
        {
          name: ROUTER.PREFERENCES_USER_SETTINGS.CHILDNAME,
          path: ROUTER.PREFERENCES_USER_SETTINGS.CHILDPATH,
        },
        {
          name: ROUTER.PREFERENCES_ALIAS.CHILDNAME,
          path: ROUTER.PREFERENCES_ALIAS.CHILDPATH,
        },
        {
          name: ROUTER.PREFERENCES_ADVANCED.CHILDNAME,
          path: ROUTER.PREFERENCES_ADVANCED.CHILDPATH,
        },
        {
          name: ROUTER.PREFERENCES_MAPPING.CHILDNAME,
          path: ROUTER.PREFERENCES_MAPPING.CHILDPATH,
        },
        {
          name: ROUTER.PREFERENCES_HEPSUB.CHILDNAME,
          path: ROUTER.PREFERENCES_HEPSUB.CHILDPATH,
        },
      ],
    };
  }

  selectMenuItem(index, sectionName) {
    this.leftMenu.selectedIndex = index;
  }
}

export default AppPreferences;
