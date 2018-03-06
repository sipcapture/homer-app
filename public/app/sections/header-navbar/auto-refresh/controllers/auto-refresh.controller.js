import dataRefresh from '../data/refresh_list';

class AutoRefresh {
  constructor($log, $interval, EventBus, EVENTS) {
    'ngInject';
    this.$log = $log;
    this.$interval = $interval;
    this.EventBus = EventBus;
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
      this.EventBus.broadcast(this.EVENTS.WIDGETS_GLOBAL_RELOAD, 1);
    }, delay);
  }

  off() {
    this.menu.isOpen = false;
    this.menu.title = 'Off';
    this.$interval.cancel(this.loop);
  }
}

export default AutoRefresh;
