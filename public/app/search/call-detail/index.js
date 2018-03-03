import angular from 'angular';
import CallDetail from './call-detail';
import Export from './export';
import Media from './media';
import Info from './info';
import Flow from './flow';
import Messages from './messages';
import Blacklist from './blacklist';
import Dtmf from './dtmf';
import Graph from './graph';
import Logs from './logs';
import LogsRemote from './logs-remote';
import Recording from './recording';
import Timeline from './timeline';
import Wss from './wss';

export default angular.module('hepicApp.call-detail-components', [
  CallDetail.name,
  Export.name,
  Media.name,
  Info.name,
  Flow.name,
  Messages.name,
  Blacklist.name,
  Dtmf.name,
  Graph.name,
  Logs.name,
  LogsRemote.name,
  Recording.name,
  Timeline.name,
  Wss.name,
]);
