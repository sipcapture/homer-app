import angular from 'angular';
import CallDetail from './call-detail';
import CallDetailExport from './call-detail-export';
import CallDetailMedia from './call-detail-media';
import CallDetailInfo from './call-detail-info';
import CallDetailFlow from './call-detail-flow';
import CallDetailMessages from './call-detail-messages';
import CallDetailBlacklist from './call-detail-blacklist';
import CallDetailDtmf from './call-detail-dtmf';
import CallDetailGraph from './call-detail-graph';
import CallDetailLogs from './call-detail-logs';
import CallDetailLoki from './call-detail-loki';
import CallDetailLogsRemote from './call-detail-logs-remote';
import CallDetailRecording from './call-detail-recording';
import CallDetailTimeline from './call-detail-timeline';
import CallDetailHepsub from './call-detail-hepsub';
import CallDetailWss from './call-detail-wss';
import CallDetailQos from './call-detail-qos';

export default angular.module('hepicApp.call-detail-components', [
  CallDetail.name,
  CallDetailExport.name,
  CallDetailMedia.name,
  CallDetailInfo.name,
  CallDetailFlow.name,
  CallDetailMessages.name,
  CallDetailBlacklist.name,
  CallDetailDtmf.name,
  CallDetailGraph.name,
  CallDetailLogs.name,
  CallDetailLoki.name,
  CallDetailLogsRemote.name,
  CallDetailRecording.name,
  CallDetailTimeline.name,
  CallDetailWss.name,
  CallDetailHepsub.name,
  CallDetailQos.name
]);
