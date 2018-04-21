class CallDetailMessages {
  constructor($log) {
    'ngInject';
    this.$log = $log;
    this.showtable = true;
  }

  $onChanges(bindings) {
    if (Object.keys(bindings.call.currentValue).length) {
      console.log("FILDATA", this.call);
    
      this.feelGrid(this.callid, this.call);
    }
  }

  feelGrid(id, call) {
    this.headerType = 'Event';
    this.rowCollection = call.messages;
    this.displayedCollection = [].concat(this.rowCollection);
  }

  transactionCheck(type) {
    if (parseInt(type) == 86) return 'XLOG';
    else if (parseInt(type) == 87) return 'MI';
    else if (parseInt(type) == 1) return 'SIP';
    else if (parseInt(type) == 100) return 'LOG';
    else if (parseInt(type) == 88) return 'REST';
    else if (parseInt(type) == 89) return 'NET';
    else if (parseInt(type) == 4) return 'WebRTC';
    else return 'Unknown';
  }
  
  protoCheck(type) {
    if (parseInt(type) == 2) return 'UDP';
    else if (parseInt(type) == 1) return 'TCP';
    else return 'UDP';
  }

  showMessage(row, event) {
    this.onMessage({data: row, event});
  }
}

export default CallDetailMessages;
