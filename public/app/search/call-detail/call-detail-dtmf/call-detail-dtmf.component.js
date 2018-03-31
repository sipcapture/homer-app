import template from './templates/call-detail-dtmf.template.html';
import controller from './controllers/call-detail-dtmf.controller';

const callDetailDtmf = {
  controller,
  template,
  bindings: {
    enable: '<',
    logreport: '<',
  },
};

export default callDetailDtmf;
