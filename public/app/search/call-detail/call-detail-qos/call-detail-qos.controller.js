import { cloneDeep, size } from 'lodash';
import './call-detail-qos.styles.css';

class CallDetailQos {
  constructor($log, $state) {
    'ngInject';
    this.$log = $log;
    this.$state = $state;
    this.about = 'QoS';
    this.chartOptions = {
      chart: {
        type: 'multiBarChart',
        transitionDuration: 0,
        tooltipContent: function (key, x, y, e, graph) { //return html content
          return `<h3>${y} ${key}</h3></p>${e.point.label}</p>`;
        },
        reduceXTicks: false, //If 'false', every single x-axis tick label will be rendered.
        rotateLabels: 0, //Angle to rotate x-axis labels.
        showControls: false, //Allow user to switch between 'Grouped' and 'Stacked' mode.
        groupSpacing: 0.1, //Distance between each group of bars.
      }
    };
    this._raw = {
      total: 0,
      data: [],
    };
    this._reports = [];
    this._labels = [];
    this.reportData = [];
    this._stats = {};
  }

  async $onInit() {
    this._raw = {
      data: cloneDeep(this.qosData),
      total: size(this.qosData),
    };
    this._sortReports();
    this._processRTCPReports();
    this._aggregateAllStats();
  }

  _sortReports() {
    this._raw.data.sort((a,b) => (a.create_date > b.create_date) ? 1 : ((b.create_date > a.create_date) ? -1 : 0));
  }
    
  _prepare(label){
    if (!this._reports[label]) { 
      this._labels.push(label);
      this._reports[label]=[ {values: [], key: label} ] 
    }
  }

  _processRTCPReports() {
    try {
      this._raw.data.forEach((report) => {
        var rtcp = JSON.parse(report.raw) || {};
        var label = report.srcIp+'->'+report.dstIp;
        
        if (rtcp.sender_information){
          if (rtcp.sender_information.packets){
            var ts = 'packets'; this._prepare(ts);
            this._reports[ts][0].values.push({ x: report.timeSeconds+''+(report.timeUseconds||'000'), y: rtcp.sender_information.packets, label:label })
          }
          if (rtcp.sender_information.octets){
            var ts = 'octets'; this._prepare(ts);
            this._reports[ts][0].values.push({ x: report.timeSeconds+''+(report.timeUseconds||'000'), y: rtcp.sender_information.octets, label:label })
          }
        }
        if (rtcp.report_count > 0){
          if (rtcp.report_blocks[rtcp.report_count-1].highest_seq_no){
            var ts = 'highest_seq_no'; this._prepare(ts);
            this._reports[ts][0].values.push({ x: report.timeSeconds+''+(report.timeUseconds||'000'), y: rtcp.report_blocks[rtcp.report_count-1].highest_seq_no, label:label })
          }
          if (rtcp.report_blocks[rtcp.report_count-1].ia_jitter){
            var ts = 'ia_jitter'; this._prepare(ts);
            this._reports[ts][0].values.push({ x: report.timeSeconds+''+(report.timeUseconds||'000'), y: rtcp.report_blocks[rtcp.report_count-1].ia_jitter, label:label })
          }
          if (rtcp.report_blocks[rtcp.report_count-1].dlsr){
            var ts = 'dlsr'; this._prepare(ts);
            this._reports[ts][0].values.push({ x: report.timeSeconds+''+(report.timeUseconds||'000'), y: rtcp.report_blocks[rtcp.report_count-1].dlsr, label:label })
          }
          if (rtcp.report_blocks[rtcp.report_count-1].packets_lost){
            var ts = 'packets_lost'; this._prepare(ts);
            this._reports[ts][0].values.push({ x: report.timeSeconds+''+(report.timeUseconds||'000'), y: rtcp.report_blocks[rtcp.report_count-1].packets_lost, label:label })
          }
        }
      });
    } catch (err) {
      this.$log.error(['CallDetailQos'], `process RTCP reports: ${err.message}: ${err.stack}`);
    }
  }

  _aggregateAllStats() {
    var banlist = ['packets', 'octets', 'highest_seq_no'];
    this._labels.forEach((label) => { 
      this.reportData.push(this._reports[label][0])
      if (banlist.includes(label)) return;
      this._stats[label] = {
        min: this._reports[label][0].values.reduce((min, p) => p.y < min ? p.y : min, this._reports[label][0].values[0].y),
        max: this._reports[label][0].values.reduce((max, p) => p.y > max ? p.y : max, this._reports[label][0].values[0].y),
        avg: parseInt(this._reports[label][0].values.reduce((tot, p) => (tot + p.y) / this._reports[label][0].values.length , 0))
      }
    });
  }
}

export default CallDetailQos;
