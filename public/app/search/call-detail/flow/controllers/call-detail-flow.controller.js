/* global window */
class CallDetailFlow {

  constructor($log, $homerCflow, $homerModal) {
    'ngInject';
    this.$log = $log;
    this.$homerCflow = $homerCflow;
    this.$homerModal = $homerModal;
  }

  $onInit() {}

  $onChanges(bindings) {
    if (Object.keys(bindings.call.currentValue).length) {
      this.drawCanvas(this.callid, bindings.call.currentValue);
    }
  }

  drawCanvas(id, call) {
    const data = this.$homerCflow.setContext(id, call);
    this.cflowid = 'cflow-' + id;

    if (!data) {
      return;
    }

    this.messages = call.messages;
    this.callid = data.callid;
    data.hostsA = data.hosts[data.hosts.length - 1];
    data.hosts.splice(-1, 1);
    this.hostsflow = data.hosts;
    this.lasthosts = data.hostsA;
    this.messagesflow = data.messages;
    this.maxhosts = data.hosts.length - 1;
    this.maxArrayHost = new Array(this.maxhosts);
  }

  showMessageById(id, event) {
    var data = this.messages[--id];
    this.showMessage(data, event);
  }
  
  showMessage(data, event) {
    const search_data = {
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

    search_data.param.transaction[data.trans] = true;
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
      id: 'message' + this.hashCode(messagewindowId),
      divLeft: posx.toString() + 'px',
      divTop: posy.toString() + 'px',
      params: search_data,
      sdata: data,
      internal: true,
    });
  }

  hashCode(str) { // java String#hashCode
    let hash = 0;
    if (str) {
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
    }
    return hash;
  }

  protoCheck(proto) {
    if (parseInt(proto) == 17) return 'udp';
    else if (parseInt(proto) == 8) return 'tcp';
    else if (parseInt(proto) == 3) return 'wss';
    else if (parseInt(proto) == 4) return 'sctp';
    else return 'udp';
  }
}

export default CallDetailFlow;
