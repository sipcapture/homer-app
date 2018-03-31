import template from './templates/call-detail-recording.template.html';
import controller from './controllers/call-detail-recording.controller';

const callDetailRecording = {
  controller,
  template,
  bindings: {
    enbale: '<',
    displayedCollection: '<',
    rowRecordingCollection: '<',
    displayedRecordingCollection: '<',
  },
};

export default callDetailRecording;
