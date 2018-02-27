import template from './templates/call-detail-media.template.html';
import controller from './controllers/call-detail-media.controller';

const callDetailMedia = {
  controller,
  template,
  bindings: {
    enableQuality: '<',
    enableRtcp: '<',
    enableXrtp: '<',
    apiD3: '<',
  },
};

export default callDetailMedia;
