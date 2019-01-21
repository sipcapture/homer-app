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
      ],
    };
  }

  $onInit() {
    this._switchToDefaultView();
  }

  selectMenuItem(index, sectionName) {
    this.leftMenu.selectedIndex = index;
  }

  _switchToDefaultView() {
    this.$state.go(this.ROUTER.PREFERENCES_USERS.NAME);
  }
}

export default AppPreferences;
