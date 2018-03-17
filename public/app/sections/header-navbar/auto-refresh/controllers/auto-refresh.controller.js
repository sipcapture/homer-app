import dataRefresh from '../data/refresh_list';

class AutoRefresh {
  constructor($log, $interval, EventBus, TimeMachine, EVENTS) {
    'ngInject';
    this.$log = $log;
    this.$interval = $interval;
    this.EventBus = EventBus;
    this.TimeMachine = TimeMachine;
    this.EVENTS = EVENTS;
    this.loop;
    this.menu = {
      isOpen: false,
      title: 'Off',
      refresh: dataRefresh,
    };
  }

  $onInit() {}

  run(refresh) {
    this.menu.isOpen = false;
    this.menu.title = refresh.value + ' ' + refresh.unit;
    const delay = refresh.unit === 'sec' ? refresh.value * 1e3 : refresh.value * 6e4;
   
    this.$interval.cancel(this.loop);
    this.loop = this.$interval(() => {
      this.TimeMachine.shiftTime(delay);
      this.EventBus.broadcast(this.EVENTS.TIME_CHANGE);
    }, delay);
  }

  off() {
    this.menu.isOpen = false;
    this.menu.title = 'Off';
    this.$interval.cancel(this.loop);
  }
}

export default AutoRefresh;
