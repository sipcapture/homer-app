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
    this.$log = $log;
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
        this.sarelink = msg.url && msg.url.match(/^http/) ? msg.url : '/share/' + msg.url;
        this.SweetAlert({
          title: 'Ready to Share!',
          text: 'Your session can be accessed <a target="_blank" href="' + this.sharelink + '">here</a>',
          html: true,
        });
      } else {
        this.SweetAlert({
          title: 'Oops!',
          type: 'error',
          text: 'Your session could not be shared!<br>If this persists, contact your Administrator',
          html: true,
        });
      }
    }).catch((error) => {
      this.$log.error('[CallDetailExport exportShare]', error);
    });
  }

  makeReportRequest(fdata) {
    this.SearchService.makeReportRequest(fdata, 'call').then((msg) => {
      this.isReportBusy = false;
      const filename = this.getCallFileName() + '.zip';
      const contentType = 'application/zip';
      const blob = new Blob([msg], {
        type: contentType,
      });
      fileSaver.saveAs(blob, filename);
    }).catch((error) => {
      this.$log.error('[CallDetailExport makeReportRequest]', error);
    });
  }

  exportDiv(prefix) {
    this.exporting = true;
    const target = !prefix ? this.cflowid : prefix + this.cflowid;
    const cb = () => {
      this.exporting = false;
      clearTimeout(cdT);
      this.EventBus.resizeNull();
    };
    const cdT = setTimeout(function() {
      cb();
    }, 8000);

    let myEl = document.getElementById(target);
    let clone = myEl.cloneNode(true);
    clone.id = target + '_clone';
    clone.style.position = 'relative';
    clone.style.top = '0';
    clone.style.width = '100%';
    clone.style.height = 'auto';
    clone.style.overflow = 'visible';
    clone.style.background = '#FFF';
    document.body.appendChild(clone);

    html2canvas(clone, {
      logging: false,
    }).then(function(canvas) {
      const used = document.getElementById(target + '_clone');
      if (used) {
        used.parentNode.removeChild(used);
      }
      const myImage = canvas.toDataURL();
      window.open(myImage);
      cb();
    }).catch((error) => {
      this.$log.error('[CallDetailExport exportDiv]', error);
    });
  }

  getCallFileName() {
    //const transaction = this.transaction.calldata[0];
    //const tsHms = new Date(transaction.milli_ts);
    const transaction = "call-";
    const tsHms = new Date();
    const date = (tsHms.getMonth() + 1) + '/' + tsHms.getDate() + '/' + tsHms.getFullYear();
    const time = tsHms.getHours() + ':' + tsHms.getMinutes() + ':' + tsHms.getSeconds();
    return `HEPIC-${transaction.destination_ip}-${transaction.ruri_user}-${date} ${time}`;
  }

  makePcapText(fdata, type) {
    this.SearchService.makePcapTextforTransaction(fdata, type, 'call').then((msg) => {
      this.isPcapBusy = false;
      this.isTextBusy = false;
      this.isCloudBusy = false;

      this.$log.error('[CallDetailExport TEST!]', msg);
      this.$log.error('[CallDetailExport TYPE!]', type);

      let filename = this.getCallFileName() + '.pcap';
      let contentType = 'application/pcap';

      if (type == 1) {
        filename = this.getCallFileName() + '.txt';
        contentType = 'attacment/text;charset=utf-8';
      } else if (type == 2) {
        if (msg.data && msg.data.hasOwnProperty('url')) {
          this.SweetAlert({
            title: 'Export Done!',
            text: 'Your PCAP can be accessed <a target="_blank" href="' + msg.data.url + '">here</a>',
            html: true,
          });
        } else {
          let error = 'Please check your settings';
          if (msg.data && msg.data.hasOwnProperty('exceptions')) error = msg.data.exceptions;
          this.SweetAlert({
            title: 'Error',
            type: 'error',
            text: 'Your PCAP could not be uploaded!<BR>' + error,
            html: true,
          });
        }
        return;
      }
      const blob = new Blob([msg], {
        type: contentType,
      });
      fileSaver.saveAs(blob, filename);
    }).catch((error) => {
      this.$log.error('[CallDetailExport makePcapText]', error);
    });
  }
}

export default CallDetailExport;
