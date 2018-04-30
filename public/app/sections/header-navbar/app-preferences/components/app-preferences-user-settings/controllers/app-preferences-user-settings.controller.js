import {pick, cloneDeep} from 'lodash';
import swal from 'sweetalert';

class AppPreferencesUserSettings {
  constructor($uibModal, $state, UserSettingsService, log, ROUTER) {
    'ngInject';
    this.log = log;
    this.log.initLocation('AppPreferencesUserSettings');
    this.$uibModal = $uibModal;
    this.$state = $state;
    this.UserSettingsService = UserSettingsService;
    this.ROUTER = ROUTER;
    this.smartTable = {
      options: {
        pagination: '',
        items_by_page: 10,
        displayed_pages: 7,
      },
    };
  }

  $onInit() {
  }

  addSettings() {
    this.$uibModal.open({
      component: 'appPreferencesUserSettingsAddEdit',
    }).result.then((settings) => {
      this.addUserSettingsToStorage(settings);
    });
  }

  editSettings(settings) {
    this.$uibModal.open({
      component: 'appPreferencesUserSettingsAddEdit',
      resolve: {
        settings: () => {
          return cloneDeep(settings);
        },
      },
    }).result.then((settings) => {
      this.updateUserSettingsInStorage(settings);
    });
  }

  async deleteSettings(settings) {
    const mustDelete = await swal({
      icon: 'warning',
      title: 'Delete user settings?',
      text: 'Once deleted, you will not be able to recover this!',
      buttons: true,
      dangerMode: true,
    });

    if (mustDelete) {
      try {
        await this.UserSettingsService.delete(settings.guid);
        this._tableSettingsDelete(settings);
      } catch (err) {
        this.log.error(err.message);
      }
    }
  }

  async updateUserSettingsInStorage(settings) {
    if (!settings) {
      this.log.warn('no user settings was updated by modal');
      return;
    }

    try {
      const data = pick(settings, ['guid', 'username', 'partid', 'category', 'param', 'data']);
      await this.UserSettingsService.update(data);
      this._tableSettingsUpdate();
    } catch (err) {
      this.log.error(err.message);
    }
  }

  async addUserSettingsToStorage(settings) {
    if (!settings) {
      this.log.warn('no user settings was added by modal');
      return;
    }

    try {
      const data = pick(settings, ['username', 'partid', 'category', 'param', 'data']);
      await this.UserSettingsService.add(data);
      this._tableSettingsAdd(settings);
    } catch (err) {
      this.log.error(err.message);
    }
  }

  _tableSettingsDelete(settings) {
    this.userSettings.splice(this.userSettings.findIndex((u) => u.guid === settings.guid), 1);
    this.$state.reload(this.ROUTER.PREFERENCES_USER_SETTINGS.NAME);
  }

  _tableSettingsAdd(settings) {
    this.userSettings.push(settings);
    this.$state.reload(this.ROUTER.PREFERENCES_USER_SETTINGS.NAME);
  }

  _tableSettingsUpdate() {
    this.$state.reload(this.ROUTER.PREFERENCES_USER_SETTINGS.NAME);
  }
}

export default AppPreferencesUserSettings;
