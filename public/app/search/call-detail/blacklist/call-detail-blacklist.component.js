import template from './templates/call-detail-blacklist.template.html';
import controller from './controllers/call-detail-blacklist.controller';

const callDetailBlacklist = {
  controller,
  template,
  bindings: {
    enable: '<',
    blacklistreport: '<',
  },
};

export default callDetailBlacklist;
