import {cloneDeep} from 'lodash';

class AppPreferences {
  constructor($state, $scope, UserService, ROUTER, $log) {
    'ngInject';
    this.$state = $state;
    this.$scope = $scope;
    this.UserService = UserService;
    this.ROUTER = ROUTER;
    this.$log = $log;

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
    this.placeSectionNamesIntoCategories();
    this.switchToDefaultView();
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

  // handlePersist(sectionName, data) {
  //   assign(this.appPreferences[this.sections.activeSectionName].data, data);
  //   this.persistToDb(sectionName, data);
  // }

  // async persistToDb(sectionName, data) {
  //   this._hideErrMessage();
  //   if (sectionName === 'users') {
  //     this.UserService.store(data).then(() => {
  //       // this.appPreferences.users.data = this._cleanUserPasswordInputField(this.appPreferences.users.data);
  //     }).catch((err) => {
  //       this.$log.error(['AppPreferences', 'persist'], `fail to persist: ${err.message}`);
  //       this._showErrMessage(err.message);
  //     });
  //   }
  // }

  // _showErrMessage(text) {
  //   setTimeout(() => {
  //     this.$scope.$apply(() => {
  //       this.message.err.enabled = true;
  //       this.message.err.text = text || '';
  //     });
  //   });
  // }

  // _hideErrMessage(text) {
  //   setTimeout(() => {
  //     this.$scope.$apply(() => {
  //       this.message.err.enabled = false;
  //       this.message.err.text = text || '';
  //     });
  //   });
  // }

  // /*
  // * @param {array} users
  // */
  // _cleanUserPasswordInputField(users) {
  //   users.forEach((user) => {
  //     user.password = '';
  //   });
  //   return users;
  // }
}

export default AppPreferences;
