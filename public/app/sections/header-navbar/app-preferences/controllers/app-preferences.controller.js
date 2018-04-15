import '../style/style.css';

import {assign, cloneDeep} from 'lodash';

class AppPreferences {
  constructor() {
    'ngInject';
  }

  $onInit() {
    this.editor = {
      data: cloneDeep(this.appPreferences.data),
      schema: cloneDeep(this.appPreferences.schema),
    };
  }

  handlePersist(data) {
    assign(this.appPreferences.data, data);
  }
}

export default AppPreferences;
