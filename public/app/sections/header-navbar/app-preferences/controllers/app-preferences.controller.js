import {cloneDeep, isEmpty} from 'lodash';

class AppPreferences {
  constructor($state, $scope, UserService, ROUTER, log) {
    'ngInject';
    this.$state = $state;
    this.$scope = $scope;
    this.UserService = UserService;
    this.ROUTER = ROUTER;
    this.log = log;
    this.log.initLocation('AppPreferences');

    this.sections = {
      selectedIndex: 0,
      activeSectionName: 'users',
      categories: {
        admin: {},
      },
    };

    this.message = {
      err: {
        enabled: false,
        text: 'Message',
      },
    };

    this.editorTrigger = {
      save: function() {},
    };
  }

  $onInit() {
    this._appPreferences = cloneDeep(this.appPreferences);
    if (isEmpty(this._appPreferences)) {
      this.log.error('fail to load app preferences');
    } else {
      this.placeSectionNamesIntoCategories();
      this.switchToDefaultView();
    }
  }

  selectSection(index, sectionName) {
    this.sections.selectedIndex = index;
    this.sections.activeSectionName = sectionName;
  }

  switchToDefaultView() {
    this.$state.go(this.ROUTER.PREFERENCES_USER_EDITOR.NAME);
  }

  placeSectionNamesIntoCategories() {
    this.sections.categories.admin = Object.keys(this._appPreferences);
  }
}

export default AppPreferences;
