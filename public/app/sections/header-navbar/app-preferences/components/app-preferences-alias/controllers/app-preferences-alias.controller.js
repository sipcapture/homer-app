import {pick, cloneDeep} from 'lodash';
import swal from 'sweetalert';

class AppPreferencesAlias {
  constructor($uibModal, $state, AliasService, log) {
    'ngInject';
    this.log = log;
    this.log.initLocation('AppPreferencesAlias');
    this.$uibModal = $uibModal;
    this.$state = $state;
    this.AliasService = AliasService;
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

  addAlias() {
    this.$uibModal.open({
      component: 'appPreferencesAliasAddEdit',
    }).result.then((alias) => {
      this.addAliasToStorage(alias);
    });
  }

  editAlias(alias) {
    this.$uibModal.open({
      component: 'appPreferencesAliasAddEdit',
      resolve: {
        alias: () => {
          return cloneDeep(alias);
        },
      },
    }).result.then((alias) => {
      this.updateAliasInStorage(alias);
    });
  }

  async deleteAlias(alias) {
    const mustDelete = await swal({
      icon: 'warning',
      title: 'Delete alias?',
      text: 'Once deleted, you will not be able to recover this!',
      buttons: true,
      dangerMode: true,
    });

    if (mustDelete) {
      try {
        await this.AliasService.delete(alias.guid);
        this._tableAliasDelete(alias);
      } catch (err) {
        this.log.error(err.message);
      }
    }
  }

  async updateAliasInStorage(alias) {
    if (!alias) {
      this.log.warn('no alias was updated by modal');
      return;
    }

    try {
      const data = pick(alias, ['guid', 'alias', 'ip', 'port', 'mask', 'captureID', 'status']);
      await this.AliasService.update(data);
      this._tableAliasUpdate();
    } catch (err) {
      this.log.error(err.message);
    }
  }

  async addAliasToStorage(alias) {
    if (!alias) {
      this.log.warn('no alias was added by modal');
      return;
    }

    try {
      const data = pick(alias, ['alias', 'ip', 'port', 'mask', 'captureID', 'status']);
      await this.AliasService.add(data);
      this._tableAliasAdd(alias);
    } catch (err) {
      this.log.error(err.message);
    }
  }

  _tableAliasDelete(alias) {
    this.aliases.splice(this.aliases.findIndex((u) => u.guid === alias.guid), 1);
    this._reloadThisState();
  }

  _tableAliasAdd(alias) {
    this.aliases.push(alias);
    this._reloadThisState();
  }

  _tableAliasUpdate() {
    this._reloadThisState();
  }

  _reloadThisState() {
    this.$state.reload();
  }
}

export default AppPreferencesAlias;
