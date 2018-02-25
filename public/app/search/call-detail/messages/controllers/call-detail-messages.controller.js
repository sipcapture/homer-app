class CallDetailMessages {

  constructor($log) {
    'ngInject';
    this.$log = $log;
    this.showtable = true;
  }

  $onChanges(bindings) {
    if (Object.keys(bindings.call.currentValue).length) {
      this.feelGrid(this.callid, this.call);
    }
  }

  feelGrid(id, call) {
    this.headerType = 'SIP Method';
    this.rowCollection = call.messages;
    this.displayedCollection = [].concat(this.rowCollection);
  }

  transactionCheck(type) {
    if (parseInt(type) == 86) return 'XLOG';
    else if (parseInt(type) == 87) return 'MI';
    else if (parseInt(type) == 88) return 'REST';
    else if (parseInt(type) == 89) return 'NET';
    else if (parseInt(type) == 4) return 'WebRTC';
    else return 'SIP';
  }

  showMessage(row, event) {
    this.onMessage({data: row, event});
  }
}

export default CallDetailMessages;
