class ProtosearchWidgetSettings {
  constructor(CONFIGURATION, SearchService) {
    'ngInject';
    this.CONFIGURATION = CONFIGURATION;
    this.SearchService = SearchService;
  }

  $onInit() {
    this.counter = 0;
    this.widget = this.resolve.widget;
    this.headers = [];
    this.protoTransactions = {};
    this.addDataToProto();
  }

  dismiss() {
    this.modalInstance.dismiss();
  }
  
  submit() {
    this.modalInstance.close(this.widget);
  }

  addDataToProto() {
    this.protoData = [];
    let hashLocal = [];
    this.headers = [];

    this.SearchService.loadMappingProtocols().then((data) => {
      console.log('GOT', data);
      this.protoTransactions = data.length ? data : {};
    }).then(() => {
      this.protoTransactions.forEach((field) => {
        if (hashLocal.indexOf(field.hepid) == -1) {
          let lobj = {
            name: field.hep_alias,
            value: field.hepid,
          };
  
          this.protoData.push(lobj);
          hashLocal.push(field.hepid);
        }
      });
                  
      // END To-do
    }).catch((error) => {
      this.$log.error('[ProtosearchWidget]', '[load mapping protocols]', error);
    });
  }

  onProtoSelect() {

    this.profileData = [];
    this.headers = [];
    
    let id = this.widget.config.protocol_id.value;
    this.protoTransactions.forEach((field) => {
      if (field.hepid == id) {
        let lobj = {
          name: field.profile,
          value: field.profile,
        };
        this.profileData.push(lobj);
      }
    });
  }
  
  onProfileSelect() {
    let id = this.widget.config.protocol_id.value;
    let profile = this.widget.config.protocol_profile.value;
    this.headers = [];
    
    this.SearchService.loadMappingFields(id, profile).then((data) => {
      console.log('GOT FIELDS', data);
      this.fieldsData = data.fields_mapping ? data.fields_mapping : [];
    }).then(() => {
      console.log('FIELDS...', this.fieldsData);
      this.fieldsData.forEach((field) => {
        console.log('RRR', field);
      
        let lobj = {
          name: id+':'+profile+':'+field.id,
          selection: field.name,
          type: field.type,
          index: field.index,
          form_type: field.form_type,
          form_default: field.form_default,
          disabled: false,
          hepid: id,
          profile: profile,
        };
        
        this.headers.push(lobj);
      });
      
      
      // END To-do
    }).catch((error) => {
      this.$log.error('[ProtosearchWidget]', '[load fields]', error);
    });
  }

  addField() {
    this.widget.fields.push({name: 'default' + this.counter});
  }
  
  removeField(index) {
    this.widget.fields.splice(index, 1);
  }
}

export default ProtosearchWidgetSettings;
