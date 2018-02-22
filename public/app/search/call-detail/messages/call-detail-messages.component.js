import template from './templates/call-detail-messages.template.html';
import controller from './controllers/call-detail-messages.controller';

const callDetailMessages = {
  controller,
  template,
  bindings: {
    callid: '<',
    call: '<',
  },
};

export default callDetailMessages;
