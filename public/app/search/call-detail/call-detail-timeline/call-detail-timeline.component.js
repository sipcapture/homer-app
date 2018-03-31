import template from './templates/call-detail-timeline.template.html';
import controller from './controllers/call-detail-timeline.controller';

const callDetailTimeline = {
  controller,
  template,
  bindings: {
    uniqueips: '<',
    messages: '<',
    transaction: '<',
  },
};

export default callDetailTimeline;
