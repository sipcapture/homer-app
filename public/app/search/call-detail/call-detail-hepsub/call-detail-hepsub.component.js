import template from './templates/call-detail-hepsub.template.html';
import controller from './controllers/call-detail-hepsub.controller';

const callDetailHepsub = {
  controller,
  template,
  bindings: {
    hepsubreport: '=',
    onMatchJson: '&',
  },
};

export default callDetailHepsub;
