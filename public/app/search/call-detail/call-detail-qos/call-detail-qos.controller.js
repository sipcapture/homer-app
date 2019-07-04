/* global d3 */
import { cloneDeep, size } from 'lodash';
import './call-detail-qos.styles.css';

class CallDetailQos {
  constructor($log, $state) {
    'ngInject';
    this.$log = $log;
    this.$state = $state;
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
    this._configureChart();
  }

  _sortReports() {
    if(this._raw.data['rtcp']) this._raw.data['rtcp'].data.sort((a,b) => (a.create_date > b.create_date) ? 1 : ((b.create_date > a.create_date) ? -1 : 0));
    if(this._raw.data['rtp']) this._raw.data['rtp'].data.sort((a,b) => (a.create_date > b.create_date) ? 1 : ((b.create_date > a.create_date) ? -1 : 0));
  }
    
  _prepare(label){
    if (!this._reports[label]) { 
      this._labels.push(label);
      this._reports[label]=[ {values: [], key: label} ] 
    }
  }

  _processRTCPReports() {
    try {
    
      let dataRtcp=[], dataRtp=[];
      
      if(this._raw.data["rtcp"] && this._raw.data["rtcp"].data) {
        
        dataRtcp = this._raw.data["rtcp"].data;
        dataRtcp.forEach((report) => {

          var rtcp = JSON.parse(report.raw) || {};
          var label = report.srcIp+'->'+report.dstIp;
          var sid = report.sid;

          if (rtcp.sender_information){
            if (rtcp.sender_information.packets){
              var ts = 'packets'; this._prepare(ts);
              this._reports[ts][0].values.push({ x: report.timeSeconds+''+(report.timeUseconds||'000'), 
                                                y: rtcp.sender_information.packets, 
                                                label:label, sid:sid })
            }
            if (rtcp.sender_information.octets){
              var ts = 'octets'; this._prepare(ts);
              this._reports[ts][0].values.push({ x: report.timeSeconds+''+(report.timeUseconds||'000'), 
                                                y: rtcp.sender_information.octets, 
                                                label:label, sid:sid })
            }
          }
          if (rtcp.report_count > 0){
            if (rtcp.report_blocks[rtcp.report_count-1].highest_seq_no){
              var ts = 'highest_seq_no'; this._prepare(ts);
              this._reports[ts][0].values.push({ x: report.timeSeconds+''+(report.timeUseconds||'000'), 
                                                y: rtcp.report_blocks[rtcp.report_count-1].highest_seq_no, 
                                                label:label, sid:sid })
            }
            if (rtcp.report_blocks[rtcp.report_count-1].ia_jitter){
              var ts = 'ia_jitter'; this._prepare(ts);
              this._reports[ts][0].values.push({ x: report.timeSeconds+''+(report.timeUseconds||'000'), 
                                                y: rtcp.report_blocks[rtcp.report_count-1].ia_jitter, 
                                                label:label, sid:sid })
            }
            if (rtcp.report_blocks[rtcp.report_count-1].dlsr){
              var ts = 'dlsr'; this._prepare(ts);
              this._reports[ts][0].values.push({ x: report.timeSeconds+''+(report.timeUseconds||'000'), 
                                                y: rtcp.report_blocks[rtcp.report_count-1].dlsr, 
                                                label:label, sid:sid })
            }
            if (rtcp.report_blocks[rtcp.report_count-1].packets_lost){
              var ts = 'packets_lost'; this._prepare(ts);
              this._reports[ts][0].values.push({ x: report.timeSeconds+''+(report.timeUseconds||'000'), 
                                                y: rtcp.report_blocks[rtcp.report_count-1].packets_lost, 
                                                label:label, sid:sid })
            }
            if (rtcp.report_blocks[rtcp.report_count-1].lsr){
              var ts = 'lsr'; this._prepare(ts);
              this._reports[ts][0].values.push({ x: report.timeSeconds+''+(report.timeUseconds||'000'), 
                                                y: rtcp.report_blocks[rtcp.report_count-1].lsr, 
                                                label:label, sid:sid })
            }
          }
        });

      }
      
      if(this._raw.data["rtp"] && this._raw.data["rtp"].data) {
        
        dataRtp = this._raw.data["rtp"].data;
        dataRtp.forEach((report) => {
          var rtp = JSON.parse(report.raw) || {};
          var label = report.srcIp+'->'+report.dstIp;
          var sid = report.sid;

          //{\"CORRELATION_ID\":\"euh25c@127.0.0.1\",\"RTP_SIP_CALL_ID\":\"euh25c@127.0.0.1\",
          //\"DELTA\":19.983,\"JITTER\":0.017,\"REPORT_TS\":1561991946.563,\"TL_BYTE\":0,\"SKEW\":0.000,\"TOTAL_PK\":1512,\"EXPECTED_PK\":1512,\"PACKET_LOSS\":0,\"SEQ\":0,\"MAX_JITTER\":0.010,
          //\"MAX_DELTA\":20.024,\"MAX_SKEW\":0.172,\"MEAN_JITTER\":0.005,\"MIN_MOS\":4.032, \"MEAN_MOS\":4.032, \"MOS\":4.032,\"RFACTOR\":80.200,\"MIN_RFACTOR\":80.200,\"MEAN_RFACTOR\":80.200,
          //\"SRC_IP\":\"64.249.222.113\", \"SRC_PORT\":26872, \"DST_IP\":\"55.66.77.86\",\"DST_PORT\":51354,\"SRC_MAC\":\"00-30-48-7E-5D-C6\",\"DST_MAC\":\"00-12-80-D7-38-5E\",\"OUT_ORDER\":0,
          //\"SSRC_CHG\":0,\"CODEC_PT\":9, \"CLOCK\":8000,\"CODEC_NAME\":\"g722\",\"DIR\":0,\"REPORT_NAME\":\"64.249.222.113:26872\",\"PARTY\":0,\"TYPE\":\"PERIODIC\"}","create_date":1561991953000},

          var rtp_fields = ["TOTAL_PK","EXPECTED_PK","JITTER","MOS","DELTA","PACKET_LOSS", "OUT_ORDER"];
          rtp_fields.forEach(function(field){
            if (rtp[field]){
              var ts = field; this._prepare(ts);
              this._reports[ts][0].values.push({ x: report.timeSeconds+''+(report.timeUseconds||'000'),
                                                y: rtp[field],
                                                label:label, sid:sid })
            }
          }, this);

        });
      }

      
    } catch (err) {
      this.$log.error(['CallDetailQos'], `process QOS reports: ${err.message}: ${err.stack}`);
    }
  }

  _aggregateAllStats() {
    var banlist = ['packets', 'octets', 'highest_seq_no'];
    this._labels.forEach((label) => { 
      this.reportData.push(this._reports[label][0])
      if (banlist.includes(label)) return;
      this._stats[label] = {
        min: this._reports[label][0].values.reduce((min, p) => p.y < min ? p.y : min, this._reports[label][0].values[0].y),
        avg: parseInt(this._reports[label][0].values.reduce((tot, p) => (tot + p.y) / this._reports[label][0].values.length , 0)),
        max: this._reports[label][0].values.reduce((max, p) => p.y > max ? p.y : max, this._reports[label][0].values[0].y)
      }
    });
  }

  _configureChart() {
    
    this.chartOptions = {
      chart: {
        type: 'multiBarChart',
        xAxis: {
          axisLabel: 'Time',
          tickValues: this.reportData[0].values.map(p => p.x),
          tickFormat: function (d) {
            return d3.time.format('%X')(new Date(+d))
          }
        },
        yAxis: {
          tickFormat: d3.format('.01f')
        },
        interactive: true,
        useInteractiveGuideline: false,
        transitionDuration: 0,
        reduceXTicks: false, //If 'false', every single x-axis tick label will be rendered.
        rotateLabels: 0, //Angle to rotate x-axis labels.
        showLegend: true,
        showControls: false, //Allow user to switch between 'Grouped' and 'Stacked' mode.
        groupSpacing: 0.1, //Distance between each group of bars.
        callback: function (chart) {
          chart.tooltip.contentGenerator(function (e) {
            const { y, key, label, sid } = e.data;
            return `<div><h3>${y} ${key}</h3><p>${label}</p><p>${sid}</p></div>`;
          });
          return chart;
        }
      }
    };
  }
}

export default CallDetailQos;
