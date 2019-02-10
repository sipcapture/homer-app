import template from './templates/call-detail-logs.template.html';
import controller from './controllers/call-detail-logs.controller';

const callDetailLogs = {
  controller,
  template,
  bindings: {
    logreport: '=',
    onMatchJson: '&',
  },
};

export default callDetailLogs;
