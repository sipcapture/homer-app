import {pick, cloneDeep} from 'lodash';
import swal from 'sweetalert';

class AppPreferencesAdvanced {
  constructor($uibModal, $state, AdvancedService, log) {
    'ngInject';
    this.log = log;
    this.log.initLocation('AppPreferencesAdvanced');
    this.$uibModal = $uibModal;
    this.$state = $state;
    this.AdvancedService = AdvancedService;
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

  addAdvanced() {
    this.$uibModal.open({
      component: 'appPreferencesAdvancedAddEdit',
    }).result.then((alias) => {
      this.addAdvancedToStorage(alias);
    });
  }

  editAdvanced(alias) {
    this.$uibModal.open({
      component: 'appPreferencesAdvancedAddEdit',
      resolve: {
        alias: () => {
          return cloneDeep(alias);
        },
      },
    }).result.then((alias) => {
      this.updateAdvancedInStorage(alias);
    });
  }

  async deleteAdvanced(alias) {
    const mustDelete = await swal({
      icon: 'warning',
      title: 'Delete alias?',
      text: 'Once deleted, you will not be able to recover this!',
      buttons: true,
      dangerMode: true,
    });

    if (mustDelete) {
      try {
        await this.AdvancedService.delete(alias.guid);
        this._tableAdvancedDelete(alias);
      } catch (err) {
        this.log.error(err.message);
      }
    }
  }

  async updateAdvancedInStorage(alias) {
    if (!alias) {
      this.log.warn('no alias was updated by modal');
      return;
    }

    try {
      const data = pick(alias, ['guid', 'alias', 'ip', 'port', 'mask', 'captureID', 'status']);
      await this.AdvancedService.update(data);
      this._tableAdvancedUpdate();
    } catch (err) {
      this.log.error(err.message);
    }
  }

  async addAdvancedToStorage(alias) {
    if (!alias) {
      this.log.warn('no alias was added by modal');
      return;
    }

    try {
      const data = pick(alias, ['alias', 'ip', 'port', 'mask', 'captureID', 'status']);
      await this.AdvancedService.add(data);
      this._tableAdvancedAdd(alias);
    } catch (err) {
      this.log.error(err.message);
    }
  }

  _tableAdvancedDelete(alias) {
    this.aliases.splice(this.aliases.findIndex((u) => u.guid === alias.guid), 1);
    this._reloadThisState();
  }

  _tableAdvancedAdd(alias) {
    this.aliases.push(alias);
    this._reloadThisState();
  }

  _tableAdvancedUpdate() {
    this._reloadThisState();
  }

  _reloadThisState() {
    this.$state.reload(this.$state.$current.name);
  }
}

export default AppPreferencesAdvanced;
