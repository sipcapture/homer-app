import {pick, cloneDeep} from 'lodash';
import swal from 'sweetalert';

class AppPreferencesHepSub {
  constructor($uibModal, $state, HepSubService, log) {
    'ngInject';
    this.log = log;
    this.log.initLocation('AppPreferencesHepSub');
    this.$uibModal = $uibModal;
    this.$state = $state;
    this.HepSubService = HepSubService;
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

  addHepSub() {
    this.$uibModal.open({
      component: 'appPreferencesHepSubAddEdit',
    }).result.then((hepsub) => {
      this.addHepSubToStorage(hepsub);
    });
  }

  editHepSub(hepsub) {
    
    hepsub.mapping_source = JSON.stringify(hepsub.mapping, null, 2);
  
    this.$uibModal.open({
      component: 'appPreferencesHepSubAddEdit',
      resolve: {
        hepsub: () => {           
          return cloneDeep(hepsub);
        },
      },
    }).result.then((hepsub) => {
      hepsub.mapping = JSON.parse(hepsub.mapping_source);
      delete hepsub.mapping_source;
      this.updateHepSubInStorage(hepsub);
    });
  }

  async deleteHepSub(hepsub) {
    const mustDelete = await swal({
      icon: 'warning',
      title: 'Delete hepsub?',
      text: 'Once deleted, you will not be able to recover this!',
      buttons: true,
      dangerMode: true,
    });

    if (mustDelete) {
      try {
        await this.HepSubService.delete(hepsub.guid);
        this._tableHepSubDelete(hepsub);
      } catch (err) {
        this.log.error(err.message);
      }
    }
  }

  async updateHepSubInStorage(hepsub) {
    if (!hepsub) {
      this.log.warn('no hepsub was updated by modal');
      return;
    }

    try {
      const data = pick(hepsub, ['guid', 'profile', 'hepid', 'hep_alias', 'version','mapping']);      
      
      await this.HepSubService.update(data);
      this._tableHepSubUpdate();
    } catch (err) {
      this.log.error(err.message);
    }
  }

  async addHepSubToStorage(hepsub) {
    if (!hepsub) {
      this.log.warn('no hepsub was added by modal');
      return;
    }

    try {
      const data = pick(hepsub, ['guid', 'profile', 'hepid', 'hep_alias', 'version','mapping']);
      await this.HepSubService.add(data);
      this._tableHepSubAdd(hepsub);
    } catch (err) {
      this.log.error(err.message);
    }
  }

  _tableHepSubDelete(hepsub) {
    this.hepsubs.splice(this.hepsubs.findIndex((u) => u.guid === hepsub.guid), 1);
    this._reloadThisState();
  }

  _tableHepSubAdd(hepsub) {
    this.hepsubs.push(hepsub);
    this._reloadThisState();
  }

  _tableHepSubUpdate() {
    this._reloadThisState();
  }

  _reloadThisState() {
    this.$state.reload(this.$state.$current.name);
  }
}

export default AppPreferencesHepSub;
