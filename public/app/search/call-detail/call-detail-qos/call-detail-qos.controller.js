/* global d3 */

class CallDetailQos {
  constructor($log, $state) {
    'ngInject';
    this.$log = $log;
    this.$state = $state; // Access state and url params via $state.params
    this.about = 'QoS tab for Lorenzo';
    this.qosD3Chart = {
      data: {},
      events: {},
      api: {},
      config: {},
    };
  }

  $onInit() {
    // Put init code here

    // The binded data stuff is avalable here:
    //  this.someObjectToStare;
    //  this.someFnToExecute();
  }

  $onDestroy() {
    // Put here a code which is executed when controller is destroyed
  }
}

export default CallDetailQos;
