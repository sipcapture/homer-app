import template from './templates/call-detail-graph.template.html';
import controller from './controllers/call-detail-graph.controller';

const callDetailGraph = {
  controller,
  template,
  bindings: {
    enable: '<',
    logreport: '<',
    livelogs: '<',
    ipalias: '<',
  },
};

export default callDetailGraph;
