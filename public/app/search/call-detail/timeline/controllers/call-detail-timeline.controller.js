import {DataSet} from 'vis';
import {forEach} from 'lodash';

class CallDetailTimeline {
  constructor($log, $scope) {
    'ngInject';
    this.$log = $log;
    this.$scope = $scope;
    this.enable = true;
    this.timeline = {
      data: {},
      events: {},
      options: {
        orientation: 'top',
        align: 'center',
        autoResize: true,
        editable: false,
        selectable: true,
        margin: 25,
        minHeight: '300px',
        showCurrentTime: false,
      },
    };
    this.tl = {
      groups: [],
      data: [],
    };
    this.data = {
      groups: new DataSet(),
      items: new DataSet(),
    };
  }
 
  $onInit() {
    this.tl.groups = this.initGroups(this.uniqueips);

    try {
      this.tl.data = this.tl.data.concat(this.getMessageDetails(this.messages, this.tl.groups));
    } catch (err) {
      this.$log.error(['CallDetailTimeline'], 'fail to parse message details');
    }

    try {
      this.tl.data = this.tl.data.concat(this.getTransactionDetails(this.transaction, this.tl.groups));
    } catch (e) {
      this.$log.error(['CallDetailTimeline'], 'fail to parse transaction details');
    }

    this.$scope.$watch('ldData', () => {
      this.update();
      try {
        this.data.items.add(this.$scope.tlData);
      } catch (err) {
        this.$log.error(['CallDetailTimeline'], 'fail to add item');
      }
    });

    this.$scope.$watch('ldGroups', () => {
      this.update();
      try {
        this.data.groups.clear(); // to-do: clear because of error 'Cannot add item: item with id 0 already exists'
        this.data.groups.add(this.tl.groups);
      } catch (err) {
        this.$log.error(['CallDetailTimeline'], 'fail to add group');
      }
    });
  }

  initGroups(uniqueips) {
    const groups = [];
    forEach(uniqueips, (v, k) => {
      groups.push({
        content: v,
        id: k,
        style: `background-color:${this.randie()}`,
      });
    });
    return groups;
  }

  getMessageDetails(messages, groups) {
    const data = [];
    forEach(messages, (msg) => {
      data.push({
        group: this.getGroup(groups, msg),
        start: new Date(msg.micro_ts / 1000),
        content: msg.method ? msg.method : msg.event,
      });
    });
    return data;
  }

  getGroup(groups, msg) {
    let group = groups.findIndex((g) => g.content == `${msg.source_ip}:${msg.source_port}`);
    if (group == -1) {
      group = groups.findIndex((g) => g.content == msg.source_ip);
    }
    return group;
  }

  getTransactionDetails(transaction, groups) {
    const data = [];
    forEach(transaction, (trans) => {
      const group = this.getGroup(groups, trans);
      if (trans.cdr_start != 0) {
        data.push({
          start: new Date(trans.cdr_start * 1000),
          style: 'background-color:green;',
          group,
          content: 'CDR Start',
        });
      }
      if (trans.cdr_ringing != 0) {
        data.push({
          start: new Date(trans.cdr_ringing * 1000),
          style: 'background-color:yellow;',
          group,
          content: 'CDR Ringing',
        });
      }
      if (trans.cdr_progress != 0) {
        data.push({
          start: new Date(trans.cdr_progress * 1000),
          style: 'background-color:blue;',
          group,
          content: 'CDR Progress',
        });
      }
      if (trans.cdr_stop != 0) {
        data.push({
          start: new Date(trans.cdr_stop * 1000),
          style: 'background-color:red;',
          group,
          content: 'CDR Stop',
        });
      }
    });
    return data;
  }

  update() {
    this.timeline.data = {
      groups: this.data.groups,
      items: this.data.items,
    };
  }

  randie() {
    const random = (Math.floor((256 - 229) * Math.random()) + 230);
    return `rgb(${random},${random},${random})`;
  }
}

export default CallDetailTimeline;
