/*global angular, document, window, Blob*/

import fileSaver from 'file-saver';
import * as d3 from 'd3';
//import {DataSet} from 'vis';

import treeData from '../data/tree_data';

//// style
//import 'vis/dist/vis.css';
//import 'nvd3/build/nv.d3.css';

var CallDetail = function($scope, $compile, $log, SearchService, $homerModal, $homerCflow, $timeout, $sce, localStorageService, $filter, UserProfile, EventBus) {
  'ngInject';
  const self = this;

  const bindings = $scope.$parent.bindings;
  let data = bindings.params;
  $scope.id = data.customId;
  $scope.data = data;
  $scope.call = {};

  this.$onInit = function () {
    SearchService.searchCallByTransaction(data).then(function(msg) {
      if (msg) {
        if (msg.transaction) {
          $scope.enableTransaction = true;
        }
        $scope.call = msg;
        $scope.feelGrid($scope.id, msg);
        $scope.drawCanvas($scope.id, msg);
        $scope.setSDPInfo(msg);
        /* and now we should do search for LOG and QOS*/
        angular.forEach(msg.callid, function(v, k) {
          console.log('K', k);
          if (data.param.search.callid.indexOf(k) == -1) {
            data.param.search.callid.push(k);
          }
        });

        // Unique IP Array for Export
        try {
          console.log('scanning for IPs...');
          var cached = [];
          angular.forEach(msg.hosts, function(v) {
            cached.push(v.hosts[0]);
          });
          if (cached.length > 0) {
            $scope.uniqueIps = cached;
          }
        } catch (e) {
          console.log(e);
        }

        /* IP GRAPH DISPLAY (experimental) */

        /*  TIMELINE TEST END */
        $scope.showQOSReport(data);
        $scope.showLogReport(data);
        $scope.showRecordingReport(data);
      }
    }).catch(function(error) {
      $log.error('[CallDetail]', error);
    }).finally(function() {
      $scope.dataLoading = false;
    });
  };

  this.expandModal = function (id) {
    // to-do: this currently doesn't work because id is undefined
    const modal = document.getElementById(id);
    const content = modal.getElementsByClassName('modal-body')[0];

    if ((modal.style.extop == modal.style.top && modal.style.exleft == modal.style.left) && (modal.style.extop != '100%' && modal.style.top != '100%') && !modal.style.fullscreen) {
      console.log('rogue/dupe resize!');
      return;
    }

    if (!modal.style.extop && modal.style.width != '100%') {
      modal.style.fullscreen = true;
      modal.style.extop = modal.style.top;
      modal.style.exleft = modal.style.left;
      modal.style.exheight = modal.style.height;
      modal.style.exwidth = modal.style.width ? modal.style.width : '';
      modal.style.top = '0px';
      modal.style.left = '0px';
      modal.style.height = '100%';
      modal.style.width = '100%';
      content.style.height = '95%';
      content.style.width = '100%';
    } else {
      modal.style.fullscreen = false;
      modal.style.top = modal.style.extop;
      modal.style.left = modal.style.exleft ? modal.style.exleft : (window.innerWidth - modal.style.width) / 2 + 'px';
      modal.style.height = modal.style.exheight;
      modal.style.width = modal.style.exwidth;
      modal.style.extop = false;
      content.style.height = '95%';
      content.style.width = '100%';
    }
    modal.classList.toggle('full-screen-modal');
    $scope.drawCanvas($scope.id, $scope.transaction);
  };

  this.closeModal = function () {
    $scope.$parent.closeModal();
  };

  $scope.dataLoading = true;
  $scope.showSipMessage = true;
  $scope.showSipDetails = false;

  $scope.clickSipDetails = function() {
    console.log('details');
  };

  var profile = UserProfile.getServerProfile('dashboard');
  console.log('SETTINGS:', profile);

  /* Timeline Datasets */
  $scope.tlGroups = [];
  $scope.tlData = [];

  $scope.timelineReady = false;
  $scope.timelineReadyGo = function() {
    $scope.timelineReady = true;
  };

  $scope.transaction = [];
  $scope.clickArea = [];
  $scope.msgCallId = data.param.search.callid[0];
  $scope.collapsed = [];
  $scope.enableTransaction = false;
  //$scope.enableQualityReport = false;
  //$scope.enableRTCPReport = false;
  $scope.enableLogReport = false;
  $scope.enableRecordingReport = false;
  $scope.enableDTMFReport = false;
  $scope.enableBlacklist = false;
  $scope.enableRemoteLogReport = false;
  $scope.enableRtcReport = false;
  //$scope.enableXRTPReport = false;
  $scope.enableRTPAgentReport = false;
  $scope.enableQOSChart = false;
  $scope.LiveLogs = [];


  $scope.enableGraph = false;
  $scope.enableTimeline = false;

  $scope.getColor = d3.scale.category20(); // d3 v3 scale, for reference only. To-do: delete during the final review
  //$scope.getColor = d3.scaleOrdinal(d3.schemeCategory20);
  $scope.LiveGraph = [];
  $scope.LiveGraph.data = {
    nodes: [],
    links: []
  };
  $scope.LiveGraph.options = {
    chart: {
      type: 'forceDirectedGraph',
      margin: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20
      },
      height: 400,
      width: 400,

      linkStrength: 0.1,
      friction: 0.3,
      linkDist: 250,
      gravity: 0.2,
      charge: -300,
      radius: 20,

      background: '#fff',
      color: function(d) {
        return $scope.getColor(d.name);
      },
      tooltip: {
        contentGenerator: function() {
          return '<div></div>';
        }
      },
      nodeExtras: function(node) {
        node && node
          .append('text')
          .attr('dx', 24)
          .attr('dy', '.38em')
          .attr('text-anchor', 'top')
          .text(function(d) {
            return (d.type ? d.type + ' ' : '') + d.name;
          })
          .style('font-size', '12px');
      }
    }
  };

  $scope.tabExec = function() {
    EventBus.refreshChart();
    EventBus.resizeNull();
  };

  $scope.tabs = [{
    'heading': 'Messages',
    'active': true,
    'select': function() {
      $scope.refreshGrid();
    },
    'ngshow': 'tab',
    'icon': 'zmdi zmdi-grid',
  }, {
    'heading': 'Flow',
    'active': true,
    'select': function() {
      EventBus.resizeNull();
    },
    'ngshow': 'tab',
    'icon': 'fa fa-exchange',
  }, {
    'heading': 'IP Graph',
    'active': true,
    'select': function() {
      EventBus.resizeNull();
    },
    'ngshow': 'enableGraph',
    'icon': 'fa fa-exchange',
  }, {
    'heading': 'Timeline',
    'active': true,
    'ngclick': function($scope) {
      $scope.timelineReadyGo();
    },
    'select': function() {
      EventBus.resizeNull();
    },
    'ngshow': 'enableTimeline',
    'icon': 'fa fa-exchange',
  }, {
    'heading': 'Call Info',
    'active': true,
    'select': function() {
      EventBus.refreshChart();
    },
    'ngshow': 'enableTransaction',
    'icon': 'glyphicon glyphicon-info-sign',
  }, {
    'heading': 'Media Reports',
    'active': true,
    'select': function() {
      EventBus.refreshChart();
    },
    'ngshow': 'enableQualityReport || enableXRTPReport || enableRTCPReport',
    'icon': 'glyphicon glyphicon-signal',
  }, {
    'heading': 'DTMF',
    'active': true,
    'ngshow': 'enableDTMFReport',
    'select': function() {
      EventBus.resizeNull();
    },
    'icon': 'fa fa-file-text-o',
  }, {
    'heading': 'Logs',
    'active': true,
    'ngshow': 'enableLogReport',
    'select': function() {
      EventBus.resizeNull();
    },
    'icon': 'fa fa-file-text-o',
  }, {
    'heading': 'Recording',
    'active': true,
    'ngshow': 'enableRecordingReport',
    'select': function() {
      EventBus.resizeNull();
    },
    'icon': 'fa fa-play-circle-o',
  }, {
    'heading': 'Remote Logs',
    'active': true,
    'select': function() {
      EventBus.resizeNull();
    },
    'ngshow': 'enableRemoteLogReport',
    'icon': 'fa fa-file-text-o',
  }, {
    'heading': 'WSS',
    'active': true,
    'select': function() {
      EventBus.resizeNull();
    },
    'ngshow': 'enableRtcReport',
    'icon': 'fa fa-exchange',
  }, {
    'heading': 'Blacklist',
    'active': true,
    'select': function() {
      EventBus.resizeNull();
    },
    'ngshow': 'enableBlacklist',
    'icon': 'fa fa-ban',
  }, {
    'heading': 'Export',
    'active': false,
    'select': function() {
      EventBus.resizeNull();
    },
    'ngshow': 'tab',
    'icon': 'glyphicon glyphicon-download-alt',
  }];

  $scope.getCallIDColor = function(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    i = hash;
    var col = ((i >> 24) & 0xAF).toString(16) + ((i >> 16) & 0xAF).toString(16) +
      ((i >> 8) & 0xAF).toString(16) + (i & 0xAF).toString(16);
    if (col.length < 6) col = col.substring(0, 3) + '' + col.substring(0, 3);
    if (col.length > 6) col = col.substring(0, 6);
    return {
      color: '#' + col
    };
  };

  $scope.colorsChart = ['aqua', 'black', 'blue', 'fuchsia', 'gray', 'green', 'lime', 'maroon', 'navy', 'olive', 'orange', 'purple', 'red', 'silver', 'teal', 'white', 'yellow'];

  /* convertor */
  $scope.XRTP2value = function(prop) {
    var res = prop;
    switch (prop) {
    case 'CD':
      res = 'SEC';
      break;
    case 'JI':
      res = 'JITTER';
      break;
    case 'PR':
      res = 'RCVD';
      break;
    case 'PS':
      res = 'SENT';
      break;
    case 'PL':
      res = 'LOST';
      break;
    case 'PD':
      res = 'DELAY';
      break;
    case 'IP':
      res = 'MEDIA IP:PORT';
      break;
    default:
      break;
    }
    return res;
  };

  /* new param */
  $scope.beginRTCPDataDisplay = new Date();
  $scope.endRTCPDataDisplay = new Date();
  $scope.beginRTCPDataIsSet = false;
  $scope.TimeOffSetMs = (new Date($scope.beginRTCPDataDisplay)).getTimezoneOffset() * 60 * 1000;
  $scope.calc_report = {
    list: [],
    from: 0,
    to: 0,
    totalRtcpMessages: 0,
    totalPacketLost: 0,
    averagePacketLost: 0,
    maxPacketLost: 0,
    totalPackets: 0,
    averageJitterMsec: 0,
    maxJitterMsec: 0
  };

  $scope.jittersFilterAll = true;
  $scope.packetsLostFilterAll = true;
  /* jitter */

  $scope.toggleTree = function(id) {
    $scope.collapsed[id] = !$scope.collapsed[id];
  };

  $scope.getNumber = function(num) {
    return new Array(num);
  };

  $scope.drawCanvas = function(id, mydata) {

    var data = $homerCflow.setContext(id, mydata);
    $scope.cflowid = 'cflow-' + id;
    console.log('canvas id:', id);
    console.log('canvas data:', data);
    if (!data) return;
    $scope.messages = mydata.messages;
    $scope.callid = data.callid;

    data.hostsA = data.hosts[data.hosts.length - 1];
    data.hosts.splice(-1, 1);

    $scope.hostsflow = data.hosts;
    $scope.lasthosts = data.hostsA;

    $scope.messagesflow = data.messages;
    $scope.maxhosts = data.hosts.length - 1;
    console.log($scope.maxhosts);
    $scope.maxArrayHost = new Array($scope.maxhosts);
  };

  $scope.transactionCheck = function(type) {
    if (parseInt(type) == 86) return 'XLOG';
    else if (parseInt(type) == 87) return 'MI';
    else if (parseInt(type) == 88) return 'REST';
    else if (parseInt(type) == 89) return 'NET';
    else if (parseInt(type) == 4) return 'WebRTC';
    else return 'SIP';
  };

  $scope.protoCheck = function(proto) {
    if (parseInt(proto) == 17) return 'udp';
    else if (parseInt(proto) == 8) return 'tcp';
    else if (parseInt(proto) == 3) return 'wss';
    else if (parseInt(proto) == 4) return 'sctp';
    else return 'udp';
  };

  $scope.showtable = true;
  $scope.activeMainTab = true;

  $scope.feelGrid = function(id, mydata) {
    var messages = mydata['messages'];
    $scope.headerType = 'SIP Method';
    $scope.rowCollection = messages;
    $scope.displayedCollection = [].concat($scope.rowCollection);
  };

  $scope.showMessage = function(data, event) {
    var search_data = {
      timestamp: {
        from: parseInt(data.micro_ts / 1000),
        to: parseInt(data.micro_ts / 1000)
      },
      param: {
        search: {
          id: parseInt(data.id),
          callid: data.callid
        },
        location: {
          node: data.dbnode
        },
        transaction: {
          call: false,
          registration: false,
          rest: false
        }
      }
    };

    search_data['param']['transaction'][data.trans] = true;
    var messagewindowId = '' + data.id + '_' + data.trans;

    var posx = event.clientX;
    var posy = event.clientY;
    var winx = window.screen.availWidth;
    var diff = parseInt((posx + (winx / 3) + 20) - (winx));
    // Reposition popup in visible area
    if (diff > 0) {
      posx -= diff;
    }
  
    self.hashCode = function(str) { // java String#hashCode
      var hash = 0;
      if (str) {
        for (let i = 0; i < str.length; i++) {
          hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
      }
      return hash;
    };

    $homerModal.open({
      template: '<call-message-detail></call-message-detail>',
      component: true,
      cls: 'homer-modal-message',
      id: 'message' + self.hashCode(messagewindowId),
      divLeft: posx.toString() + 'px',
      divTop: posy.toString() + 'px',
      params: search_data,
      sdata: data,
      internal: true,
      onOpen: function() {
        console.log('modal1 message opened from url ' + this.id);
      },
    });
  };

  $scope.playStream = function(data, event) {
    var search_data = {
      timestamp: {
        from: parseInt(data.micro_ts / 1000),
        to: parseInt(data.micro_ts / 1000)
      },
      param: {
        search: {
          id: parseInt(data.id),
          callid: data.callid
        },
        location: {
          node: data.dbnode
        },
        transaction: {
          call: false,
          registration: false,
          rest: false
        }
      }
    };

    console.log(data);

    search_data['param']['transaction'][data.trans] = true;
    var messagewindowId = '' + data.id + '_' + data.trans;

    var posx = event.clientX;
    var posy = event.clientY;
    var winx = window.screen.availWidth;
    var diff = parseInt((posx + (winx / 3) + 20) - (winx));
    // Reposition popup in visible area
    if (diff > 0) {
      posx -= diff;
    }

    $homerModal.open({
      url: 'templates/dialogs/playstream.html',
      cls: 'homer-modal-message',
      id: 'playstream' + messagewindowId.hashCode(),
      divLeft: posx.toString() + 'px',
      divTop: posy.toString() + 'px',
      params: search_data,
      sdata: data,
      internal: true,
      onOpen: function() {
        console.log('modal1 message opened from url ' + this.id);
      },
      controller: 'playStreamCtrl'
    });
  };


  $scope.downloadRecordingPcap = function(data) {
    SearchService.downloadRecordingPcap(data.id, 'rtp').then(function(msg) {
      var filename = data.filename;
      var content_type = 'application/pcap';
      var blob = new Blob([msg], {
        type: content_type
      });
      fileSaver.saveAs(blob, filename);
    }).catch(function(error) {
      $log.error('[CallDetail]', error);
    });
  };

  $scope.showMessageById = function(id, event) {

    var data = $scope.messages[--id];
    $scope.showMessage(data, event);
  };

  $scope.clickMousePosition = function(event) {

    var ret = false;
    var obj = {};
    var x = event.offsetX == null ? event.originalEvent.layerX - event.target.offsetLeft : event.offsetX;
    var y = event.offsetY == null ? event.originalEvent.layerY - event.target.offsetTop : event.offsetY;

    angular.forEach($scope.clickArea, function(ca) {
      if (ca.x1 < x && ca.x2 > x && ca.y1 < y && ca.y2 > y) {
        ret = true;
        obj = ca;
        return;
      }
    });

    if (ret) {
      if (obj.type == 'host') {
        console.log('clicked on host');
      } else if (obj.type == 'message') {
        $scope.showMessage(obj.data, event);
      }
    }

    return ret;
  };

  $scope.reApplyResize = function() {
    //$scope.drawCanvas2($scope.id, $scope.transaction);
    //$scope.gridHeight = 250;
  };

  $scope.setSDPInfo = function(rdata) {
    var msg;
    console.log(rdata);
    var chartDataExtended = {
      list: [],
      from: 0,
      to: 0,
      totalRtcpMessages: 0,
      totalPacketLost: 0,
      totalJitters: 0,
      averageJitterMsec: 0,
      averagePacketLost: 0,
      maxPacketLost: 0,
      totalPackets: 0,
      maxJitterMsec: 0,
      msg: [],
      mos: [],
      averageMos: 0,
      worstMos: 5
    };

    /* transaction & sdp analyzer */
    if (rdata.transaction) {
      rdata.transaction.forEach(function(entry) {
        if (rdata.sdp[entry.callid] && rdata.sdp[entry.callid][0]) {
          entry.sdp = rdata.sdp[entry.callid][0];
        }

        if (entry.vqr_a) {
          entry.vqr_a = JSON.parse(entry.vqr_a);
          switch (true) {
          case (entry.vqr_a.mos < 1):
            entry.vqr_a.col = '#db3236';
            break;
          case (entry.vqr_a.mos < 2):
            entry.vqr_a.col = '#db3236';
            break;
          case (entry.vqr_a.mos < 3):
            entry.vqr_a.col = '#F4C20D';
            break;
          case (entry.vqr_a.mos < 4):
            entry.vqr_a.col = '#E87A22';
            break;
          case (entry.vqr_a.mos < 5):
            entry.vqr_a.col = '#3cba54';
            break;
          }
          console.log(entry.vqr_a);
        }
        if (entry.vqr_b) {
          entry.vqr_b = JSON.parse(entry.vqr_b);
          switch (true) {
          case (entry.vqr_b.mos < 1):
            entry.vqr_b.col = '#db3236';
            break;
          case (entry.vqr_b.mos < 2):
            entry.vqr_b.col = '#db3236';
            break;
          case (entry.vqr_b.mos < 3):
            entry.vqr_b.col = '#F4C20D';
            break;
          case (entry.vqr_b.mos < 4):
            entry.vqr_b.col = '#E87A22';
            break;
          case (entry.vqr_b.mos < 5):
            entry.vqr_b.col = '#3cba54';
            break;
          }
          console.log(entry.vqr_b);
        }

        /* calculate call duration */
        if (entry.cdr_start && entry.cdr_stop) {
          if (entry.cdr_start > entry.cdr_stop) {
            entry.duration = '00:00:00';
          } else {
            entry.duration = new Date((entry.cdr_stop - entry.cdr_start - 3600) * 1000).toString().split(' ')[4];
          }

        } else {
          entry.duration = '00:00:00';
        }

        ///* check blacklist */ // to-do: this check throws the following error 'bad response combination'
        //SearchService.searchBlacklist(entry.source_ip).then(function(msg) {
        //  console.log('Blacklist check ' + entry.source_ip, msg);
        //  $scope.blacklistreport = msg;
        //  $scope.enableBlacklist = true;

        //  $scope.enableLogReport = true;
        //  $scope.LiveLogs.push({
        //    data: {
        //      type: 'BlackList',
        //      data: msg
        //    }
        //  });
        //}).catch(function(error) {
        //  $log.error('[CallDetail]', error);
        //});
      });
    }

    if (rdata.sdp) {
      try {
        if (rdata.sdp) {
          $scope.call_sdp = rdata.sdp;
        }
      } catch (e) {
        console.log('no call stats');
      }
    }


    if (msg && msg.global) {

      try {
        if (msg.global.main) {
          // Call Duration
          var adur = new Date(null);
          adur.setSeconds(msg.global.main.duration / 1000); // seconds
          $scope.call_duration = adur.toISOString().substr(11, 8);
          // Map averages
          chartDataExtended.averageMos = (msg.global.main.mos_average).toFixed(2);
          chartDataExtended.worstMos = (msg.global.main.mos_worst).toFixed(2);
          chartDataExtended.totalPacketLost = msg.global.main.packets_lost;
          chartDataExtended.maxPacketLost = msg.global.main.packets_lost;
          chartDataExtended.totalPackets = msg.global.main.packets_sent + msg.global.main.packets_recv;
          chartDataExtended.averagePacketLost = (msg.global.main.packets_lost * 100 / chartDataExtended.totalPackets).toFixed(1);
          chartDataExtended.averageJitterMsec = msg.global.main.jitter_avg.toFixed(2);
          chartDataExtended.maxJitterMsec = msg.global.main.jitter_max.toFixed(2);
        }
      } catch (e) {
        console.log('no rtcp stats');
      }


      try {
        if (msg.global.calls) {
          $scope.calc_calls = msg.global.calls;
          if (!$scope.call_duration) {
            let adur = new Date(null);
            adur.setSeconds($scope.calc_calls[Object.keys($scope.calc_calls)[0]].aparty.metric.duration / 1000); // seconds
            $scope.call_duration = adur.toISOString().substr(11, 8);
          }
        }
      } catch (e) {
        console.log('no call stats');
      }

    }
  };


  $scope.showQOSReport = function(rdata) {
    /* new charts test */
    $scope.d3chart = {};
    $scope.d3chart.data = {};
    $scope.d3chart.stats = {};

    SearchService.searchQOSReport(rdata).then(function(msg) {
      /* HEPIC Types */
      if (msg.reports.rtpagent && msg.reports.rtpagent.chart) {
        if (Object.keys(msg.reports.rtpagent.chart).length == 0) return;
        $scope.enableQualityReport = true;

        var fullrep = msg.reports.rtpagent.chart;
        $scope.list_legend = [];

        angular.forEach(fullrep, function(count, key) {
          angular.forEach(fullrep[key], function(count, callid) {
            angular.forEach(fullrep[key][callid], function(count, leg) {
              var xleg = leg;
              angular.forEach(fullrep[key][callid][leg], function(count, rep) {

                var d3newchart = {
                  key: xleg,
                  values: [],
                  color: '#' + Math.floor(Math.random() * 16777215).toString(16)
                };

                $scope.list_legend.push(rep);
                angular.forEach(fullrep[key][callid][leg][rep], function(count, data) {

                  // NEW chart
                  d3newchart.values.push({
                    x: fullrep[key][callid][leg][rep][data][0], // VALUE
                    y: fullrep[key][callid][leg][rep][data][1] // TS
                  });

                  if (!$scope.d3chart.stats[rep]) $scope.d3chart.stats[rep] = {
                    raw: []
                  };
                  $scope.d3chart.stats[rep].raw.push(fullrep[key][callid][leg][rep][data][1]);

                });


                // NEW CHART
                if (!$scope.d3chart.data[0][rep]) {
                  $scope.d3chart.data[0][rep] = {
                    series: []
                  };
                }

                var d3merged = false;
                $scope.d3chart.data[0][rep].series.forEach(function(entry) {
                  // console.log('SEEK '+xleg, entry);
                  if (xleg == entry.name) {
                    entry.data.concat(entry.data);
                    d3merged = true;
                  }
                });

                // Create new group if non-mergeable
                if (!d3merged) {
                  $scope.d3chart.data[0][rep].series.push(d3newchart);

                }

                $scope.d3chart.stats[rep].min = Math.min.apply(null, $scope.d3chart.stats[rep].raw);
                $scope.d3chart.stats[rep].max = Math.max.apply(null, $scope.d3chart.stats[rep].raw);

              });
            });
          });
        });
      }


      /* CLASSIC version below */

      var chartDataExtended = {
        list: [],
        from: 0,
        to: 0,
        totalRtcpMessages: 0,
        totalPacketLost: 0,
        totalJitters: 0,
        averageJitterMsec: 0,
        averagePacketLost: 0,
        maxPacketLost: 0,
        totalPackets: 0,
        maxJitterMsec: 0,
        msg: [],
        mos: [],
        averageMos: 0,
        worstMos: 5
      };

      if (msg.global) {

        try {
          if (msg.global.main) {
            // Call Duration
            var adur = new Date(null);
            adur.setSeconds(msg.global.main.duration / 1000); // seconds
            $scope.call_duration = adur.toISOString().substr(11, 8);
            // Map averages
            chartDataExtended.averageMos = (msg.global.main.mos_average).toFixed(2);
            chartDataExtended.worstMos = (msg.global.main.mos_worst).toFixed(2);
            chartDataExtended.totalPacketLost = msg.global.main.packets_lost;
            chartDataExtended.maxPacketLost = msg.global.main.packets_lost;
            chartDataExtended.totalPackets = msg.global.main.packets_sent + msg.global.main.packets_recv;
            chartDataExtended.averagePacketLost = (msg.global.main.packets_lost * 100 / chartDataExtended.totalPackets).toFixed(1);
            chartDataExtended.averageJitterMsec = msg.global.main.jitter_avg.toFixed(2);
            chartDataExtended.maxJitterMsec = msg.global.main.jitter_max.toFixed(2);
          }
        } catch (e) {
          console.log('no rtcp stats');
        }


        try {
          if (msg.global.calls) {
            $scope.calc_calls = msg.global.calls;
            if (!$scope.call_duration) {
              let adur = new Date(null);
              adur.setSeconds($scope.calc_calls[Object.keys($scope.calc_calls)[0]].aparty.metric.duration / 1000); // seconds
              $scope.call_duration = adur.toISOString().substr(11, 8);
            }
          }
        } catch (e) {
          console.log('no call stats');
        }

        try {
          if (msg.reports.xrtpstats && msg.reports.xrtpstats.main) {
            $scope.calc_xrtp = msg.reports.xrtpstats.main;
            $scope.calc_xrtp.mos_avg = $scope.calc_xrtp.mos_avg.toFixed(2);
            $scope.calc_xrtp.mos_worst = $scope.calc_xrtp.mos_worst.toFixed(2);
            $scope.calc_xrtp.packets_all = parseInt($scope.calc_xrtp.packets_sent) + parseInt($scope.calc_xrtp.packets_recv);
            $scope.calc_xrtp.lost_avg = ($scope.calc_xrtp.packets_lost * 100 / $scope.calc_xrtp.packets_all).toFixed(2);
          }
        } catch (e) {
          console.log('no x-rtp stats');
        }


        try {
          if (msg.reports.rtpagent && msg.reports.rtpagent.main) {
            $scope.calc_rtpagent = msg.reports.rtpagent.main;
            $scope.calc_rtpagent.mos_average = $scope.calc_rtpagent.mos_average.toFixed(2);
            $scope.calc_rtpagent.mos_worst = $scope.calc_rtpagent.mos_worst.toFixed(2);
            $scope.calc_rtpagent.lost_avg = ($scope.calc_rtpagent.packets_lost * 100 / $scope.calc_rtpagent.total_pk).toFixed(2);
          }
        } catch (e) {
          console.log('no rtpagent stats');
        }


        // RTCP
        try {
          if (msg.reports.length != 0) {

            var charts = {};
            if (msg.reports.rtcp && msg.reports.rtcp.chart) {
              //$scope.showQOSChart();
              console.log('processing rtcp charts');
              charts = msg.reports.rtcp.chart;
            }

            // RTCP-XR
            if (msg.reports.rtcpxr && msg.reports.rtcpxr.chart) {
              console.log('processing rtcpxr charts');
              //$scope.chartData.concat(msg.reports.rtcpxr.chart);
              var xrcharts = msg.reports.rtcpxr.chart;
              angular.forEach(xrcharts, function(count, key) {
                if (!charts[key]) charts[key] = count;
              });
            }

            // RTPAGENT
            if (msg.reports.rtpagent && msg.reports.rtpagent.chart) {
              console.log('processing rtpagent charts');
              //$scope.chartData.concat(msg.reports.rtcpxr.chart);
              var agcharts = msg.reports.rtpagent.chart;
              angular.forEach(agcharts, function(count, key) {
                if (!charts[key]) charts[key] = count;
              });
            }

            $scope.chartData = charts;
            $scope.streamsChart = {};
            var i = 0;
            angular.forEach(charts, function(count, key) {
              $scope.streamsChart[key] = {};
              $scope.streamsChart[key]['enable'] = true;
              $scope.streamsChart[key]['name'] = key;
              $scope.streamsChart[key]['short_name'] = key.substr(key.indexOf(' ') + 1);
              $scope.streamsChart[key]['type'] = key.substr(0, key.indexOf(' '));
              $scope.streamsChart[key]['sub'] = {};
              angular.forEach(count, function(v, k) {
                $scope.streamsChart[key]['sub'][k] = {};
                $scope.streamsChart[key]['sub'][k]['enable'] = false;
                $scope.streamsChart[key]['sub'][k]['parent'] = key;
                $scope.streamsChart[key]['sub'][k]['name'] = k;
                $scope.streamsChart[key]['sub'][k]['color'] = $scope.colorsChart[i++];
                if (k == 'mos') $scope.streamsChart[key]['sub'][k]['enable'] = true;
              });
            });

            var selData = $scope.presetQOSChartData();
            $scope.showQOSChart(selData);

          }
        } catch (e) {
          console.log('no chart data', e);
        }

        console.log('Enable RTCP Report');
        $scope.calc_report = chartDataExtended;
        $scope.enableRTCPReport = true;
      }
    }).catch(function(error) {
      $log.error('[CallDetail]', error);
    }).finally(function() {
      $scope.dataLoading = false;
    });

    /*D3 */

    var apiD3 = {};

    //$scope.options = {
    //  chart: {
    //    type: 'lineChart',
    //    height: 250,
    //    margin: {
    //      top: 40,
    //      right: 20,
    //      bottom: 40,
    //      left: 55
    //    },
    //    useInteractiveGuideline: false,
    //    xAxis: {
    //      tickFormat: function(d) {
    //        return d3.time.format('%H:%M')(new Date(d * 1000));
    //      },
    //    },
    //    yAxis: {
    //      tickFormat: function(d) {
    //        return d3.format('.02f')(d);
    //      },
    //      axisLabelDistance: -10
    //    },
    //    showLegend: true
    //  }
    //};

    ///* API OF D3 */
    //$scope.callbackD3 = function(scope) {
    //  apiD3[scope.$id] = scope.api;
    //};

    angular.element(window).on('resize', function() {
      angular.forEach(apiD3, function(v) {
        v.updateWithTimeout(500);
      });
    });
  };

  $scope.addRemoveStreamSerie = function() {
    var selData = $scope.presetQOSChartData();
    $scope.showQOSChart(selData);
  };

  $scope.presetQOSChartData = function() {
    var seriesData = [];
    var chartData = $scope.chartData;
    $scope.selectedColorsChart = [];
    angular.forEach(chartData, function(count, key) {

      if ($scope.streamsChart && $scope.streamsChart[key] && $scope.streamsChart[key]['enable'] == false)
        return;

      var localData = chartData[key];
      angular.forEach(localData, function(das, kes) {
        /* skip it */
        if ($scope.streamsChart[key]['sub'][kes]['enable'] == false) return;

        var sar = {};
        sar['name'] = kes;
        sar['type'] = 'line';
        sar['color'] = $scope.streamsChart[key]['sub'][kes]['color'];

        var lDas = [];
        angular.forEach(das, function(v) {
          lDas.push([v[0], v[1]]);
        });

        lDas.sort(function(a, b) {
          return a[0] - b[0];
        });
        sar['data'] = lDas;
        seriesData.push(sar);
      });
    });
    return seriesData;
  };


  $scope.showQOSChart = function(seriesData) {
    $scope.enableQOSChart = true;
    $scope.chartConfig = {
      chart: {
        type: 'line'
      },
      title: {
        text: 'TEST',
        style: {
          display: 'none'
        }
      },
      xAxis: {
        title: {
          text: null
        },
        type: 'datetime'
      },
      yAxis: {
        title: {
          text: null
        },
        min: 0
      },
      plotOptions: {
        column: {}
      },
      tooltip: {},
      legend: {
        enabled: false,
        borderWidth: 0
      },
      series: seriesData,
      func: function(chart) {
        $scope.$evalAsync(function() {
          chart.reflow();
        });
      }
    };

    $scope.chartConfig.chart['zoomType'] = 'x';
    $scope.chartConfig.tooltip['crosshairs'] = false; // BETA CHANGE
    $scope.chartConfig.tooltip['shared'] = false; // BETA CHANGE
  };

  $scope.refreshGrid = function() {
    console.log('refresh grid');
  };


  $scope.showLogReport = function(rdata) {
    SearchService.searchLogReport(rdata).then(function(msg) {
      if (msg.length > 0) {
        $scope.enableLogReport = true;
        msg.forEach(function(entry) {
          if (entry.data) {
            try {
              entry.data = JSON.parse(entry.data);
            } catch (err) {
              $log.error(err);
            }
            /* DTMF Parser */
            if (entry.data.DTMF) {
              entry.dtmf = {};
              $scope.enableDTMFReport = true;
              try {
                entry.data.DTMF.split(';').forEach(function(item, i) {
                  if (!item || item == '') return;
                  entry.dtmf[i] = {};
                  item.split(',').forEach(function(pair) {
                    var kv = pair.split(':');
                    if (!kv[0] || !kv[1]) return;
                    entry.dtmf[i][kv[0]] = kv[1];
                  });
                });
              } catch (err) {
                $log.error(err);
                $scope.enableDTMFReport = false;
              }
            }
          }
          console.log('PARSED LOG!', entry);
        });
        $scope.logreport = msg;
      }
    }).catch(function(error) {
      $log.error('[CallDetail]', error);
    }).finally(function() {
      $scope.dataLoading = false;
    });
  };

  $scope.showRecordingReport = function(rdata) {
    SearchService.searchRecordingReport(rdata).then(function(msg) {
      if (msg.length > 0) {
        $scope.enableRecordingReport = true;

        $scope.rowRecordingCollection = msg;
        $scope.displayedRecordingCollection = [].concat($scope.rowRecordingCollection);
      }
    }).catch(function(error) {
      $log.error('[CallDetail]', error);
    }).finally(function() {
      $scope.dataLoading = false;
    });
  };

  $scope.showRemoteLogReport = function(rdata) {
    SearchService.searchRemoteLog(rdata).then(function(msg) {
      $scope.enableRemoteLogReport = true;
      if (msg && msg.hits && msg.hits.hits) $scope.remotelogreport = msg.hits.hits;
    }).catch(function(error) {
      $log.error('[CallDetail]', error);
    }).finally(function() {
      $scope.dataLoading = false;
    });
  };

  $scope.showRtcReport = function(rdata) {
    SearchService.searchRtcReport(rdata).then(function(msg) {
      if (msg && msg.length > 0) {
        $scope.enableRtcReport = true;
        $scope.rtcreport = msg;
      }
    }).catch(function(error) {
      $log.error('[CallDetail]', error);
    }).finally(function() {
      $scope.dataLoading = false;
    });
  };

  $scope.setRtcpMembers = function() {
    $scope.rtcpMembers = [];
    var tmp = {};
    $scope.rtcpreport.forEach(function(rtcpData) {
      var currentName = rtcpData.source_ip + ' -> ' + rtcpData.destination_ip;
      if (tmp[currentName] == undefined) {
        $scope.rtcpMembers.push({
          name: currentName,
          isShowJitter: true,
          isShowPacketLost: true,
          isShowStream: true
        });
        tmp[currentName] = currentName;
      }
    });
    console.log('$scope.rtcpMembers: ', $scope.rtcpMembers);
  };

  $timeout(function() {
    if ($homerModal.getOpenedModals().indexOf('tempModal') !== -1) {
      $homerModal.close('tempModal', 'var a', 'var b');
    }
  }, 5000);

  $scope.treedata2 = treeData;

};

export default CallDetail;
