import dataHeaders from '../data/headers';
import dataHeadersUserExtCr from '../data/headers_user_ext_cr';
import dataProtoTransactions from '../data/proto_transactions';

class ProtosearchWidgetSettings {
  constructor(CONFIGURATION) {
    'ngInject';
    this.CONFIGURATION = CONFIGURATION;
  }

  $onInit() {
    this.counter = 0;
    this.widget = this.resolve.widget;
    this.headers = dataHeaders;
    this.protoTransactions = dataProtoTransactions;
    
    this.addDataToProto();

    if (this.CONFIGURATION.USER_EXT_CR) {
      this.headers = this.headers.concat(dataHeadersUserExtCr);
    }
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
    this.protoTransactions.forEach((field) => {
      if (hashLocal.indexOf(field.id) == -1) {
        let lobj = {
          name: field.id,
          value: field.id,
        };
        this.protoData.push(lobj);
        hashLocal.push(field.id);
      }
    });
    this.ProfileSelect();
  }

  onProtoSelect() {
    this.profileData = [];
    let id = this.widget.config.protocol_id.value;
    this.protoTransactions.forEach((field) => {
      if (field.id == id) {
        let lobj = {
          name: field.transaction,
          value: field.transaction,
        };
        this.profileData.push(lobj);
      }
    });
  }
  
  onProfileSelect() {
  
  }

  addField() {
    this.widget.fields.push({name: 'default' + this.counter});
  }
  
  removeField(index) {
    this.widget.fields.splice(index, 1);
  }
}

export default ProtosearchWidgetSettings;
