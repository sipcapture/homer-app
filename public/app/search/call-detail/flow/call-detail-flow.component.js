import template from './templates/call-detail-flow.template.html';
import controller from './controllers/call-detail-flow.controller';

const callDetailFlow = {
  controller,
  template,
  bindings: {
    call: '<',
    callid: '<',
  },
};

export default callDetailFlow;
