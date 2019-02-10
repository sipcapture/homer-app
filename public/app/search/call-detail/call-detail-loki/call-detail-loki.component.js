import template from './templates/call-detail-loki.template.html';
import controller from './controllers/call-detail-loki.controller';

const CallDetailLoki = {
  controller,
  template,
  bindings: {
    lokireport: '=',
    onMatchJson: '&',
  },
};

export default CallDetailLoki;
