/* global window */

import treeData from '../data/tree_data';
import {forEach} from 'lodash';

class CallDetail {
  constructor($scope, $log, SearchService, $homerModal, $homerCflow, $timeout,
    UserProfile, EventBus, SearchHelper, StyleHelper) {
    'ngInject';
    this.$scope = $scope;
    this.$log = $log;
    this.$timeout = $timeout;
    this.$homerModal = $homerModal;
    this.$homerCflow = $homerCflow;
    this.SearchService = SearchService;
    this.UserProfile = UserProfile;
    this.EventBus = EventBus;
    this.SearchHelper = SearchHelper;
    this.StyleHelper = StyleHelper;
    this.dataLoading = true;
    this.call = {};
    this.apiD3 = {};
    this.transaction = [];
    this.clickArea = [];
    this.collapsed = [];
    this.LiveLogs = [];
    this.enable = {
      report: {
        quality: false,
        rtcp: false,
        xrtp: false,
        log: false,
        recording: false,
        dtmf: false,
        remotelog: false,
        rtc: false,
        rtpagent: false,
      },
      transaction: false,
      blacklist: false,
      qoschart: false,
      graph: false,
      timeline: false,
    };
    this.colorsChart = ['aqua', 'black', 'blue', 'fuchsia',
      'gray', 'green', 'lime', 'maroon',
      'navy', 'olive', 'orange', 'purple',
      'red', 'silver', 'teal', 'white', 'yellow'];
    /* new param */
    this.beginRTCPDataDisplay = new Date();
    this.endRTCPDataDisplay = new Date();
    this.beginRTCPDataIsSet = false;
    this.TimeOffSetMs = (new Date(this.beginRTCPDataDisplay)).getTimezoneOffset() * 60 * 1000;
    this.calc_report = {
      list: [],
      from: 0,
      to: 0,
      totalRtcpMessages: 0,
      totalPacketLost: 0,
      averagePacketLost: 0,
      maxPacketLost: 0,
      totalPackets: 0,
      averageJitterMsec: 0,
      maxJitterMsec: 0,
    };
    this.jittersFilterAll = true;
    this.packetsLostFilterAll = true;
    this.activeMainTab = true;
    this.treedata2 = treeData;
    this.qosData = [];
  }

  async $onInit() {
    const bindings = this.$scope.$parent.bindings;
    this.matchJSON = bindings.matchJSON;
    this.data = bindings.params;
    this.id = bindings.id;
    this.msgCallId = '';

    for (let key in this.data.param.search) {
      if (this.data.param.search.hasOwnProperty(key)) {
        this.msgCallId = this.data.param.search[key].callid[0];
      }
    };

    this.$timeout(() => {
      if (this.$homerModal.getOpenedModals().indexOf('tempModal') !== -1) {
        this.$homerModal.close('tempModal', 'var a', 'var b');
      }
    }, 5000);

    await this.getCall(this.data);
    this.initTabs();
  }

  initTabs() {
    this.tabs = [
      {
        'heading': 'Messages',
        'active': true,
        'select': () => {
          this.refreshGrid();
        },
        'ngshow': 'tab',
        'icon': 'zmdi zmdi-grid',
      },
      {
        'heading': 'Flow',
        'active': true,
        'select': () => {
          this.EventBus.resizeNull();
        },
        'ngshow': 'tab',
        'icon': 'fa fa-exchange',
      },
      {
        'heading': 'QoS',
        'active': true,
        'select': () => {
          this.refreshGrid();
        },
        'ngshow': 'tab',
        'icon': 'zmdi zmdi-grid',
      },
      {
        'heading': 'IP Graph',
        'active': true,
        'select': () => {
          this.EventBus.resizeNull();
        },
        'ngshow': 'enableGraph',
        'icon': 'fa fa-exchange',
      },
      {
        'heading': 'Timeline',
        'active': true,
        'ngclick': () => {
          this.timelineReadyGo();
        },
        'select': () => {
          this.EventBus.resizeNull();
        },
        'ngshow': '$ctrl.enable.timeline',
        'icon': 'fa fa-exchange',
      },
      {
        'heading': 'Call Info',
        'active': true,
        'select': () => {
          this.EventBus.refreshChart();
        },
        'ngshow': '$ctrl.enable.transaction',
        'icon': 'glyphicon glyphicon-info-sign',
      },
      {
        'heading': 'Media Reports',
        'active': true,
        'select': () => {
          this.EventBus.refreshChart();
        },
        'ngshow': '$ctrl.enable.report.quality || $ctrl.enable.report.xrtp || $ctrl.enable.report.rtcp',
        'icon': 'glyphicon glyphicon-signal',
      },
      {
        'heading': 'DTMF',
        'active': true,
        'ngshow': '$ctrl.enable.report.dtmf',
        'select': () => {
          this.EventBus.resizeNull();
        },
        'icon': 'fa fa-file-text-o',
      },
      {
        'heading': 'Logs',
        'active': true,
        'ngshow': '$ctrl.enable.report.log',
        'select': () => {
          this.EventBus.resizeNull();
        },
        'icon': 'fa fa-file-text-o',
      },
      {
        'heading': 'Recording',
        'active': true,
        'ngshow': '$ctrl.enable.report.recording',
        'select': () => {
          this.EventBus.resizeNull();
        },
        'icon': 'fa fa-play-circle-o',
      },
      {
        'heading': 'Remote Logs',
        'active': true,
        'select': () => {
          this.EventBus.resizeNull();
        },
        'ngshow': '$ctrl.enable.report.remotelog',
        'icon': 'fa fa-file-text-o',
      },
      {
        'heading': 'WSS',
        'active': true,
        'select': () => {
          this.EventBus.resizeNull();
        },
        'ngshow': '$ctrl.enable.report.rtc',
        'icon': 'fa fa-exchange',
      },
      {
        'heading': 'Blacklist',
        'active': true,
        'select': () => {
          this.EventBus.resizeNull();
        },
        'ngshow': '$ctrl.enable.blacklist',
        'icon': 'fa fa-ban',
      },
      {
        'heading': 'Export',
        'active': false,
        'select': () => {
          this.EventBus.resizeNull();
        },
        'ngshow': 'tab',
        'icon': 'glyphicon glyphicon-download-alt',
      },
    ];
  }

  async getCall(data) {
    try {
      this.call = await this.SearchService.searchCallByTransaction(data);
      if (this.call) {
        this.enable.transaction = this.call.transaction ? true : false;

        this.setSDPInfo(this.call);
        /* and now we should do search for LOG and QOS*/
        forEach(this.call.callid, function(v, k) {
          if (data.param.search.callid.indexOf(k) == -1) {
            data.param.search.callid.push(k);
          }
        });

        // Unique IP Array for Export
        try {
          let cached = [];
          forEach(this.call.hosts, function(v) {
            cached.push(v.hosts[0]);
          });
          if (cached.length > 0) {
            this.uniqueIps = cached; // to-do: what is uniqueIps?
          }
        } catch (err) {
          this.$log.error(['CallDetail'], 'unique ip array for export', err);
        }

        /*  TIMELINE TEST END */

        this.qosData = await this.SearchService.searchQOSReport(data);
        await this.showLogReport(data);
        this.dataLoading = false;

        try {
          console.log('Scanning for Aliases...');
          this.ip_alias = [];
          if (data && data.alias) {;
            angular.forEach(data.alias, function(v, k) {
              this.ip_alias[k.split(':')[0]] = v.split(':')[0];
              this.ip_alias[k] = v;
            });
          } else {
            this.ip_alias = [];
          }
        } catch(e) {
          console.log(e);
          this.ip_alias = [];
        }
      }
    } catch (err) {
      this.$log.error(['CallDetail'], 'get call', err);
    }
  }

  showMessage(data, event) {
    const searchData = {
      timestamp: {
        from: parseInt(data.micro_ts / 1000),
        to: parseInt(data.micro_ts / 1000),
      },
      param: {
        search: {
          id: parseInt(data.id),
          callid: data.callid,
        },
        location: {
          node: data.dbnode,
        },
        transaction: {
          call: false,
          registration: false,
          rest: false,
        },
      },
    };

    searchData.param.transaction[data.trans] = true;
    const messagewindowId = '' + data.id + '_' + data.trans;
    let posx = event.clientX;
    const posy = event.clientY;
    const winx = window.screen.availWidth;
    const diff = parseInt((posx + (winx / 3) + 20) - (winx));
    // Reposition popup in visible area
    if (diff > 0) {
      posx -= diff;
    }

    this.$homerModal.open({
      template: '<call-message-detail></call-message-detail>',
      component: true,
      cls: 'homer-modal-message',
      id: 'message' + this.SearchHelper.hashCode(messagewindowId),
      divLeft: posx.toString() + 'px',
      divTop: posy.toString() + 'px',
      params: searchData,
      sdata: data,
      internal: true,
    });
  }

  expandModal() {
    this.$scope.$parent.toggleFullscreen();
  }

  closeModal() {
    this.$scope.$parent.closeModal();
  }

  tabExec() {
    this.EventBus.refreshChart();
    this.EventBus.resizeNull();
  }

  getCallIDColor(str) {
    return this.StyleHelper.getCallIDColor(str);
  }

  /* convertor */
  XRTP2value(prop) {
    let res = prop;
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
  }

  /* jitter */
  toggleTree(id) {
    this.collapsed[id] = !this.collapsed[id];
  }

  getNumber(num) {
    return new Array(num);
  }

  clickMousePosition(event) {
    let ret = false;
    let obj = {};
    let x = event.offsetX == null ? event.originalEvent.layerX - event.target.offsetLeft : event.offsetX;
    let y = event.offsetY == null ? event.originalEvent.layerY - event.target.offsetTop : event.offsetY;

    forEach(this.clickArea, function(ca) {
      if (ca.x1 < x && ca.x2 > x && ca.y1 < y && ca.y2 > y) {
        ret = true;
        obj = ca;
        return;
      }
    });

    if (ret) {
      if (obj.type == 'host') {
      } else if (obj.type == 'message') {
        this.showMessage(obj.data, event);
      }
    }
    return ret;
  }

  async setSDPInfo(rdata) {
    let msg;
    let chartDataExtended = {
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
      worstMos: 5,
    };

    /* transaction & sdp analyzer */
    if (rdata.transaction) {
      rdata.transaction.forEach((entry) => {
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
        /* check blacklist */ // to-do: this check throws the following error 'bad response combination'
        // try {
        //   const msg = await this.SearchService.searchBlacklist(entry.source_ip);
        //   this.$log.debug('Blacklist check ' + entry.source_ip, msg);
        //   this.blacklistreport = msg;
        //   this.enableBlacklist = true;
        //   this.enableLogReport = true;
        //   this.LiveLogs.push({
        //     data: {
        //       type: 'BlackList',
        //       data: msg
        //     }
        //   });
        // } catch (err) {
        //   this.$log.error(['CallDetail'], 'blacklist', error);
        // }
      });
    }

    if (rdata.sdp) {
      try {
        if (rdata.sdp) {
          this.call_sdp = rdata.sdp;
        }
      } catch (err) {
        this.$log.error(['CallDetail'], 'no call stats', err);
      }
    }


    if (msg && msg.global) {
      try {
        if (msg.global.main) {
          // Call Duration
          let adur = new Date(null);
          adur.setSeconds(msg.global.main.duration / 1000); // seconds
          this.call_duration = adur.toISOString().substr(11, 8);
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
      } catch (err) {
        this.$log.error(['CallDetail'], 'no rtcp stats', err);
      }

      try {
        if (msg.global.calls) {
          this.calc_calls = msg.global.calls;
          if (!this.call_duration) {
            let adur = new Date(null);
            adur.setSeconds(this.calc_calls[Object.keys(this.calc_calls)[0]].aparty.metric.duration / 1000); // seconds
            this.call_duration = adur.toISOString().substr(11, 8);
          }
        }
      } catch (err) {
        this.$log.error(['CallDetail'], 'no call stats', err);
      }
    }
  }

  showLogReport(rdata) {
    this.SearchService.searchLogReport(rdata).then((msg) => {
      if (msg.length > 0) {
        this.enable.report.log = true;
        msg.forEach((entry) => {
          if (entry.data) {
            try {
              entry.data = JSON.parse(entry.data);
            } catch (err) {
              this.$log.error(['CallDetail'], err);
            }
            /* DTMF Parser */
            if (entry.data.DTMF) {
              entry.dtmf = {};
              this.enable.report.dtmf = true;
              try {
                entry.data.DTMF.split(';').forEach(function(item, i) {
                  if (!item || item == '') return;
                  entry.dtmf[i] = {};
                  item.split(',').forEach(function(pair) {
                    let kv = pair.split(':');
                    if (!kv[0] || !kv[1]) return;
                    entry.dtmf[i][kv[0]] = kv[1];
                  });
                });
              } catch (err) {
                this.$log.error(['CallDetail'], err);
                this.enable.report.dtmf = false;
              }
            }
          }
          this.$log.debug('PARSED LOG!', entry);
        });
        this.logreport = msg;
      }
    }).catch((err) => {
      this.$log.error(['CallDetail'], 'show log report', err);
    });
  }

  showRemoteLogReport(rdata) {
    this.SearchService.searchRemoteLog(rdata).then((msg) => {
      this.enable.report.remotelog = true;
      if (msg && msg.hits && msg.hits.hits) this.remotelogreport = msg.hits.hits;
    }).catch((err) => {
      this.$log.error(['CallDetail'], 'show remote log report', err);
    });
  }

  showRtcReport(rdata) {
    this.SearchService.searchRtcReport(rdata).then((msg) => {
      if (msg && msg.length > 0) {
        this.enable.report.rtcp = true;
        this.rtcreport = msg;
      }
    }).catch((err) => {
      this.$log.error(['CallDetail'], 'show rtc report', err);
    });
  }

  setRtcpMembers() {
    this.rtcpMembers = [];
    let tmp = {};
    this.rtcpreport.forEach((rtcpData) => {
      let currentName = rtcpData.source_ip + ' -> ' + rtcpData.destination_ip;
      if (tmp[currentName] == undefined) {
        this.rtcpMembers.push({
          name: currentName,
          isShowJitter: true,
          isShowPacketLost: true,
          isShowStream: true,
        });
        tmp[currentName] = currentName;
      }
    });
  }
}

export default CallDetail;
