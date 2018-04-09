import template from './templates/call-detail-export.template.html';
import controller from './controllers/call-detail-export.controller';

const callDetailExport = {
  controller,
  template,
  bindings: {
    data: '<',
    msgcallid: '<',
    transaction: '<',
    cflowid: '<',
  },
};

export default callDetailExport;
