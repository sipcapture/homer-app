import template from './templates/call-detail-graph.template.html';
import controller from './controllers/call-detail-graph.controller';

const callDetailGraph = {
  controller,
  template,
  bindings: {
    enable: '<',
  },
};

export default callDetailGraph;
