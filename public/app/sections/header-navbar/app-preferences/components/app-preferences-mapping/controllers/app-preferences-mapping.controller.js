import {pick, cloneDeep} from 'lodash';
import swal from 'sweetalert';

class AppPreferencesMapping {
  constructor($uibModal, $state, MappingService, log) {
    'ngInject';
    this.log = log;
    this.log.initLocation('AppPreferencesMapping');
    this.$uibModal = $uibModal;
    this.$state = $state;
    this.MappingService = MappingService;
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

  addMapping() {
    this.$uibModal.open({
      component: 'appPreferencesMappingAddEdit',
    }).result.then((mapping) => {
      this.addMappingToStorage(mapping);
    });
  }

  editMapping(mapping) {
    
    mapping.correlation_mapping_source = JSON.stringify(mapping.correlation_mapping, null, 2);
    mapping.fields_mapping_source = JSON.stringify(mapping.fields_mapping, null, 2);
  
    this.$uibModal.open({
      component: 'appPreferencesMappingAddEdit',
      resolve: {
        mapping: () => {           
          return cloneDeep(mapping);
        },
      },
    }).result.then((mapping) => {
      mapping.correlation_mapping = JSON.parse(mapping.correlation_mapping_source);
      mapping.fields_mapping = JSON.parse(mapping.fields_mapping_source);
      delete mapping.correlation_mapping_source;
      delete mapping.fields_mapping_source;           
      console.log("SSS", mapping);
      this.updateMappingInStorage(mapping);
    });
  }

  async deleteMapping(mapping) {
    const mustDelete = await swal({
      icon: 'warning',
      title: 'Delete mapping?',
      text: 'Once deleted, you will not be able to recover this!',
      buttons: true,
      dangerMode: true,
    });

    if (mustDelete) {
      try {
        await this.MappingService.delete(mapping.guid);
        this._tableMappingDelete(mapping);
      } catch (err) {
        this.log.error(err.message);
      }
    }
  }

  async updateMappingInStorage(mapping) {
    if (!mapping) {
      this.log.warn('no mapping was updated by modal');
      return;
    }

    try {
      const data = pick(mapping, ['guid', 'profile', 'hepid', 'hep_alias', 'partid','version','retention','partition_step','create_index','create_table','correlation_mapping','fields_mapping','mapping_settings','schema_mapping','schema_settings']);      
      
      await this.MappingService.update(data);
      this._tableMappingUpdate();
    } catch (err) {
      this.log.error(err.message);
    }
  }

  async addMappingToStorage(mapping) {
    if (!mapping) {
      this.log.warn('no mapping was added by modal');
      return;
    }

    try {
      const data = pick(mapping, ['guid', 'profile', 'hepid', 'hep_alias', 'partid','version','retention','partition_step','create_index','create_table','correlation_mapping','fields_mapping','mapping_settings','schema_mapping','schema_settings']);      
      await this.MappingService.add(data);
      this._tableMappingAdd(mapping);
    } catch (err) {
      this.log.error(err.message);
    }
  }

  _tableMappingDelete(mapping) {
    this.mappings.splice(this.mappings.findIndex((u) => u.guid === mapping.guid), 1);
    this._reloadThisState();
  }

  _tableMappingAdd(mapping) {
    this.mappings.push(mapping);
    this._reloadThisState();
  }

  _tableMappingUpdate() {
    this._reloadThisState();
  }

  _reloadThisState() {
    this.$state.reload(this.$state.$current.name);
  }
}

export default AppPreferencesMapping;
