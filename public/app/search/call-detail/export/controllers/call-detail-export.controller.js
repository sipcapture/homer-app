/* global Blob, document, window */

import fileSaver from 'file-saver';
import html2canvas from 'html2canvas';

class CallDetailExport {

  constructor($log, SearchService, SweetAlert, EventBus) {
    'ngInject';
    this.SearchService = SearchService;
    this.SweetAlert = SweetAlert;
    this.EventBus = EventBus;
    this.isPcapBusy = false;
    this.isTextBusy = false;
    this.isCloudBusy = false;
    this.exporting = false;
  }

  $onInit() {}

  exportPCAP() {
    this.isPcapBusy = true;
    this.makePcapText(this.data, 0, this.msgcallid);
  }

  exportTEXT() {
    this.isTextBusy = true;
    this.makePcapText(this.data, 1, this.msgcallid);
  }

  makeREPORT() {
    this.isTextBusy = true;
    this.makeReportRequest(this.data, this.msgcallid);
  }

  exportCloud() {
    this.isCloudBusy = true;
    this.makePcapText(this.data, 2, this.msgcallid);
  }

  exportShare() {
    this.sharelink = '';
    this.SearchService.createShareLink(this.data).then((msg) => {
      if (msg) {
        this.sarelink = msg.url && msg.url.match(/^http/) ? msg.url : '/share/' + msg.url ;
        this.SweetAlert({
          title: 'Ready to Share!',
          text: 'Your session can be accessed <a target="_blank" href="' + this.sharelink + '">here</a>',
          html: true
        });
      } else {
        this.SweetAlert({
          title: 'Oops!',
          type: 'error',
          text: 'Your session could not be shared!<br>If this persists, contact your Administrator',
          html: true
        });
      }
    }).catch((error) => {
      this.$log.error('[CallDetailExport]', error);
    });
  }

  makeReportRequest(fdata) {
    this.SearchService.makeReportRequest(fdata, 'call').then((msg) => {
      this.isReportBusy = false;
      const filename = this.getCallFileName() + '.zip';
      const content_type = 'application/zip';
      const blob = new Blob([msg], {
        type: content_type
      });
      fileSaver.saveAs(blob, filename);
    }).catch((error) => {
      this.$log.error('[CallDetailExport]', error);
    });
  }

  exportDiv(prefix) {
    this.exporting = true;
    const target = !prefix ? this.cflowid : prefix + this.cflowid;
    const cb = () => {
      this.exporting = false;
      clearTimeout(cb_t);
      this.EventBus.resizeNull();
    };
    const cb_t = setTimeout(function() {
      cb();
    }, 8000);

    var myEl = document.getElementById(target);
    var clone = myEl.cloneNode(true);
    clone.id = target + '_clone';
    clone.style.position = 'relative';
    clone.style.top = '0';
    clone.style.width = '100%';
    clone.style.height = 'auto';
    clone.style.overflow = 'visible';
    clone.style.background = '#FFF';
    document.body.appendChild(clone);

    html2canvas(clone, {
      logging: false
    }).then(function(canvas) {
      const used = document.getElementById(target + '_clone');
      if (used) {
        used.parentNode.removeChild(used);
      }
      const myImage = canvas.toDataURL();
      window.open(myImage);
      cb();
    }).catch((error) => {
      this.$log.error('[CallDetailExport]', error);
    });
  }

  getCallFileName() {
    const transaction = this.transaction.calldata[0];
    const ts_hms = new Date(transaction.milli_ts);
    const date = (ts_hms.getMonth() + 1) + '/' + ts_hms.getDate() + '/' + ts_hms.getFullYear();
    const time = ts_hms.getHours() + ':' + ts_hms.getMinutes() + ':' + ts_hms.getSeconds();
    return `HEPIC-${transaction.destination_ip}-${transaction.ruri_user}-${date} ${time}`;
  }

  makePcapText(fdata, type) {
    this.SearchService.makePcapTextforTransaction(fdata, type, 'call').then((msg) => {
      this.isPcapBusy = false;
      this.isTextBusy = false;
      this.isCloudBusy = false;

      var filename = this.getCallFileName() + '.pcap';
      let content_type = 'application/pcap';

      if (type == 1) {
        filename = this.getCallFileName() + '.txt';
        content_type = 'attacment/text;charset=utf-8';
      } else if (type == 2) {
        if (msg.data && msg.data.hasOwnProperty('url')) {
          this.SweetAlert({
            title: 'Export Done!',
            text: 'Your PCAP can be accessed <a target="_blank" href="' + msg.data.url + '">here</a>',
            html: true
          });
        } else {
          var error = 'Please check your settings';
          if (msg.data && msg.data.hasOwnProperty('exceptions')) error = msg.data.exceptions;
          this.SweetAlert({
            title: 'Error',
            type: 'error',
            text: 'Your PCAP could not be uploaded!<BR>' + error,
            html: true
          });
        }
        return;
      }
      const blob = new Blob([msg], {
        type: content_type
      });
      fileSaver.saveAs(blob, filename);
    }).catch((error) => {
      this.$log.error('[CallDetailExport]', error);
    });
  }
}

export default CallDetailExport;
