import '../style/style.css';

import {assign} from 'lodash';

class AppPreferences {
  constructor($state, ROUTER) {
    'ngInject';
    this.$state = $state;
    this.ROUTER = ROUTER;
  }

  $onInit() {
    this.goDefaultState();
  }

  $onDestroy() {}

  goDefaultState() {
    this.$state.go(this.ROUTER.PREFERENCES_EDITOR.NAME);
  }

  handlePersist(sectionName, data) {
    assign(this.appPreferences[sectionName].data, data);
  }
}

export default AppPreferences;
