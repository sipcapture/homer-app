/* global window, Blob */
import fileSaver from 'file-saver';

class CallDetailRecording {
  constructor($log, $homerModal, SearchHelper, SearchService) {
    'ngInject';
    this.$log = $log;
    this.$homerModal = $homerModal;
    this.SearchHelper = SearchHelper;
    this.SearchService = SearchService;
  }

  async downloadRecordingPcap(data) {
    try {
      const msg = await this.SearchService.downloadRecordingPcap(data.id, 'rtp');
      let filename = data.filename;
      let contentType = 'application/pcap';
      let blob = new Blob([msg], {
        type: contentType,
      });
      fileSaver.saveAs(blob, filename);
    } catch (err) {
      this.$log.error(['CallDetailRecording'], 'download recording pcap', err);
    }
  }

  playStream(data, event) {
    let searchData = {
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
  
    searchData['param']['transaction'][data.trans] = true;
    let messagewindowId = '' + data.id + '_' + data.trans;
  
    let posx = event.clientX;
    let posy = event.clientY;
    let winx = window.screen.availWidth;
    let diff = parseInt((posx + (winx / 3) + 20) - (winx));
    // Reposition popup in visible area
    if (diff > 0) {
      posx -= diff;
    }
    this.$homerModal.open({
      url: 'templates/dialogs/playstream.html',
      cls: 'homer-modal-message',
      id: 'playstream' + this.SearchHelper.hashCode(messagewindowId),
      divLeft: posx.toString() + 'px',
      divTop: posy.toString() + 'px',
      params: searchData,
      sdata: data,
      internal: true,
      onOpen: function() {
        console.log('modal1 message opened from url ' + this.id);
      },
      controller: 'playStreamCtrl', // to-do: find this ctrl and turn it into component
    });
  }
}

export default CallDetailRecording;
