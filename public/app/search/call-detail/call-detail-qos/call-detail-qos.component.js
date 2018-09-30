import template from './call-detail-qos.template.html';
import controller from './call-detail-qos.controller';

const callDetailQos = {
  controller,
  controllerAs: 'callDetailQos',
  template,
  bindings: {
    qosData: '=',
  },
};

export default callDetailQos;
