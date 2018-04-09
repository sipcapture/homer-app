import template from './templates/call-detail-info.template.html';
import controller from './controllers/call-detail-info.controller';

const callDetailInfo = {
  controller,
  template,
  bindings: {
    transaction: '<',
    messages: '<',
  },
};

export default callDetailInfo;
