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
    }).result.then((advanced) => {
      this.addAdvancedToStorage(advanced);
    });
  }

  editAdvanced(advanced) {

    advanced.data_source = JSON.stringify(advanced.data, null, 2);
        
    this.$uibModal.open({
      component: 'appPreferencesAdvancedAddEdit',
      resolve: {
        advanced: () => {
          return cloneDeep(advanced);
        },
      },
    }).result.then((advanced) => {        
      advanced.data = JSON.parse(advanced.data_source);
      delete advanced.data_source;    
      this.updateAdvancedInStorage(advanced);
    });
  }

  async deleteAdvanced(advanced) {
    const mustDelete = await swal({
      icon: 'warning',
      title: 'Delete advanced?',
      text: 'Once deleted, you will not be able to recover this!',
      buttons: true,
      dangerMode: true,
    });

    if (mustDelete) {
      try {
        await this.AdvancedService.delete(advanced.guid);
        this._tableAdvancedDelete(advanced);
      } catch (err) {
        this.log.error(err.message);
      }
    }
  }

  async updateAdvancedInStorage(advanced) {
    if (!advanced) {
      this.log.warn('no advanced was updated by modal');
      return;
    }

    try {
      const data = pick(advanced, ['guid', 'partid', 'category', 'param', 'data']);            
      await this.AdvancedService.update(data);
      this._tableAdvancedUpdate();
    } catch (err) {
      this.log.error(err.message);
    }
  }

  async addAdvancedToStorage(advanced) {
    if (!advanced) {
      this.log.warn('no advanced was added by modal');
      return;
    }

    try {
      const data = pick(advanced, ['guid', 'partid', 'category', 'param', 'data']);            
      await this.AdvancedService.add(data);
      this._tableAdvancedAdd(advanced);
    } catch (err) {
      this.log.error(err.message);
    }
  }

  _tableAdvancedDelete(advanced) {
    this.globalsettings.splice(this.globalsettings.findIndex((u) => u.guid === advanced.guid), 1);
    this._reloadThisState();
  }

  _tableAdvancedAdd(advanced) {
    this.globalsettings.push(advanced);
    this._reloadThisState();
  }

  _tableAdvancedUpdate() {
    this._reloadThisState();
  }

  _reloadThisState() {
    this.$state.reload();
  }
}

export default AppPreferencesAdvanced;
