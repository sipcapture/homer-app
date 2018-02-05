export default [
  {
    _hepic_translation: 'hepic.pages.results.id',
    field: 'id',
    displayName: 'Id',
    type: 'number',
    cellTemplate: '<div  ng-click="grid.appScope.$ctrl.showTransaction(row, $event)" class="ui-grid-cell-contents"><span>{{COL_FIELD}}</span></div>',
    width: '*'
  },
  {
    _hepic_translation: 'hepic.pages.results.date',
    field: 'micro_ts',
    displayName: 'Date',
    cellTemplate: '<div class="ui-grid-cell-contents" title="date">{{grid.appScope.$ctrl.dateConvert(row.entity.micro_ts)}}</div>',
    resizable: true,
    type: 'date',
    width: '*',
    minWidth: 180
  },
  {
    _hepic_translation: 'hepic.pages.results.callid',
    field: 'callid',
    displayName: 'CallID',
    resizable: true,
    width: '*',
    minWidth: 180,
    type: 'string',
    cellTemplate: '<div class="ui-grid-cell-contents" ng-click="grid.appScope.$ctrl.showTransaction(row, $event)"><span ng-style="grid.appScope.$ctrl.getCallIDColor(row.entity.callid)" title="{{COL_FIELD}}">{{COL_FIELD}}</span></div>'
  },
  {
    _hepic_translation: 'hepic.pages.results.fromuser',
    field: 'from_user',
    displayName: 'From User',
    resizable: true,
    type: 'string',
    width: '*'
  },
  {
    _hepic_translation: 'hepic.pages.results.ruriuser',
    field: 'ruri_user',
    displayName: 'RURI user',
    type: 'string',
    resizable: true,
    width: '*'
  },
  {
    _hepic_translation: 'hepic.pages.results.touser',
    field: 'to_user',
    displayName: 'To User',
    resizable: true,
    type: 'string',
    width: '*'
  },
  {
    _hepic_translation: 'hepic.pages.results.geodst',
    field: 'geo_cc',
    displayName: 'Geo',
    resizable: true,
    type: 'string',
    width: '*',
    maxWidth: 50,
    cellTemplate: '<div ng-show="COL_FIELD" class="ui-grid-cell-contents" title="{{COL_FIELD}}" alt="{{COL_FIELD}}"><span style="font-size:7px;"><img ng-src="{{grid.appScope.$ctrl.getCountryFlag(row.entity.geo_cc)}}" lazy-src border="0"></span></div>'
  },
  {
    _hepic_translation: 'hepic.pages.results.useragent',
    field: 'uas',
    type: 'string',
    displayName: 'User Agent',
    width: '*',
  },
  {
    _hepic_translation: 'hepic.pages.results.status',
    field: 'status',
    displayName: 'Status',
    minWidth: 100,
    resizable: true,
    type: 'string',
    width: '*',
    cellTemplate: '<div class="ui-grid-cell-contents"><span ng-style="grid.appScope.$ctrl.getCallStatusColor(row.entity.status, row.isSelected, row.entity.transaction)" title="status" translate="{{grid.appScope.$ctrl.getCallStatus(row.entity.status, row.entity.transaction)}}"></span></div>'
  },
  {
    _hepic_translation: 'hepic.pages.results.srcip',
    name: 'source',
    field: 'source_ip',
    minWidth: 120,
    resizable: true,
    type: 'string',
    width: '*',
    displayName: 'Source Host',
    cellTemplate: '<div class="ui-grid-cell-contents" title="{{ grid.appScope.$ctrl.getColumnTooltip(row, col) }}">{{COL_FIELD}}</div>'
  },
  {
    _hepic_translation: 'hepic.pages.results.srcport',
    field: 'source_port',
    displayName: 'SPort',
    minwidth: 80,
    type: 'number',
    width: '*',
    resizable: true
  },
  {
    _hepic_translation: 'hepic.pages.results.dstip',
    field: 'destination_ip',
    displayName: 'Destination Host',
    minWidth: 120,
    width: '*',
    type: 'string',
    cellTemplate: '<div class="ui-grid-cell-contents" title="{{ grid.appScope.$ctrl.getColumnTooltip(row, col) }}">{{ COL_FIELD }}</div>'
  },
  {
    _hepic_translation: 'hepic.pages.results.dstport',
    field: 'destination_port',
    minWidth: 50,
    type: 'number',
    width: '*',
    displayName: 'DPort'
  },
  {
    _hepic_translation: 'hepic.pages.results.duration',
    field: 'cdr_duration',
    displayName: 'Duration',
    type: 'date',
    minWidth: 80,
    width: '*',
    cellTemplate: '<div class="ui-grid-cell-contents" title="date">{{grid.appScope.$ctrl.getCallDuration(row.entity.cdr_start, row.entity.cdr_stop)}}</div>'
  },
  {
    _hepic_translation: 'hepic.pages.results.reserved',
    field: 'reserve',
    displayName: 'MOS',
    type: 'string',
    minWidth: 40,
    width: '*',
    cellTemplate: '<div class="ui-grid-cell-contents"><span ng-style="grid.appScope.$ctrl.getMosColor(row.entity.reserve)">{{ row.entity.reserve ? (row.entity.reserve / 100) : "" }}</span></div>'
  },
  {
    _hepic_translation: 'hepic.pages.results.cdrstart',
    field: 'cdr_start',
    visible: false,
    displayName: 'Start',
    type: 'date',
    width: '*',
    cellTemplate: '<div class="ui-grid-cell-contents" title="date">{{grid.appScope.$ctrl.dateSecondsConvert(row.entity.cdr_start)}}</div>'
  },
  {
    _hepic_translation: 'hepic.pages.results.cdrstop',
    field: 'cdr_stop',
    visible: false,
    displayName: 'Stop',
    type: 'date',
    width: '*',
    cellTemplate: '<div class="ui-grid-cell-contents" title="date">{{grid.appScope.$ctrl.dateSecondsConvert(row.entity.cdr_stop)}}</div>'
  },
  {
    _hepic_translation: 'hepic.pages.results.proto',
    field: 'proto',
    displayName: 'Proto',
    type: 'number',
    resizable: true,
    width: '*',
    cellTemplate: '<div class="ui-grid-cell-contents" title="proto">{{grid.appScope.$ctrl.protoCheck(row, col)}}</div>'
  },
  {
    _hepic_translation: 'hepic.pages.results.event',
    field: 'event',
    displayName: 'Event',
    type: 'string',
    resizable: true,
    width: '*',
    cellTemplate: '<div class="ui-grid-cell-contents" title="proto">{{grid.appScope.$ctrl.eventCheck(row, col)}}</div>'
  },
  {
    _hepic_translation: 'hepic.pages.results.node',
    field: 'node',
    displayName: 'Node',
    visible: false,
    width: '*',
    type: 'string',
  },
  {
    _hepic_translation: 'hepic.pages.results.correlation_id',
    field: 'hep_correlation_id',
    displayName: 'Correlation ID',
    visible: false
  },
  {
    _hepic_translation: 'hepic.pages.results.srd',
    field: 'srd',
    displayName: 'SRD',
    visible: false
  },
  {
    _hepic_translation: 'hepic.pages.results.sss',
    field: 'sss',
    displayName: 'SSS',
    visible: false
  },
  {
    _hepic_translation: 'hepic.pages.results.geolat',
    field: 'geo_lat',
    displayName: 'GEO Lat',
    visible: false
  },
  {
    _hepic_translation: 'hepic.pages.results.geolan',
    field: 'geo_lan',
    displayName: 'GEO Lan',
    visible: false
  },
  {
    _hepic_translation: 'hepic.pages.results.sdpaudio',
    field: 'sdp_ap',
    displayName: 'SDP Audio',
    visible: false
  },
  {
    _hepic_translation: 'hepic.pages.results.sdpcodec',
    field: 'codec_in_audio',
    displayName: 'Codec Audio',
    visible: false
  },
  {
    _hepic_translation: 'hepic.pages.results.sdpmedia',
    field: 'sdmedia_ip',
    displayName: 'SDP Media IP',
    visible: false
  },
  {
    _hepic_translation: 'hepic.pages.results.xgroup',
    field: 'xgroup',
    displayName: 'X-Group',
    visible: false
  },
  {
    _hepic_translation: 'hepic.pages.results.mos',
    field: 'mos',
    displayName: 'MOS 2',
    visible: false
  }
];
