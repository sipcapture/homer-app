class CallDetailFlow {

  constructor($log, $homerCflow) {
    'ngInject';
    this.$log = $log;
    this.$homerCflow = $homerCflow;
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
    this.onMessage({data, event});
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
