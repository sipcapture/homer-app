import '../style/date-picker.style.css';

import {assign} from 'lodash';
import moment from 'moment';

import QuickRange from './classes/quickrange';
import CustomRange from './classes/customrange';

class DatePicker {
  constructor($log, UserProfile, TimeMachine, EventBus, EVENTS) {
    'ngInject';
    this.$log = $log;
    this.UserProfile = UserProfile;
    this.TimeMachine = TimeMachine;
    this.EventBus = EventBus;
    this.EVENTS = EVENTS;
  }

  $onInit() {
    this.menu = {
      isOpen: false,
    };

    this.timerange = this.TimeMachine.getTimerange();
    this.timezone = this.TimeMachine.getTimezone();

    this.quick = new QuickRange();
    this.custom = new CustomRange();
  }

  setNow(field) {
    this.timerange = assign(this.timerange, this.custom.getNowDate(field, this.timezone.value));
  }

  setCustom() {
    this.menu.isOpen = false;
    const from = moment(this.timerange.from).format('MMM, DD, YYYY HH:mm:ss');
    const to = moment(this.timerange.to).format('MMM, DD, YYYY HH:mm:ss');
    this.timerange.custom = `${from} to ${to}`;

    this.TimeMachine.setTimerange(this.timerange);
    this.TimeMachine.setTimezone(this.timezone);
    this.tellDashboardAboutTimeChange();
  }

  setQuick(option = null) {
    this.menu.isOpen = false;
    if (!option) {
      const title = `Last ${this.quick.custom.last} Minutes`;
      this.timerange = assign(this.timerange, this.quick.getLast(this.quick.custom.last, title, this.timezone.value));
    } else {
      this.timerange = assign(this.timerange, this.quick.getRange(option, this.timezone.value));
    }

    this.TimeMachine.setTimerange(this.timerange);
    this.tellDashboardAboutTimeChange();
  }

  tellDashboardAboutTimeChange() {
    this.EventBus.broadcast(this.EVENTS.TIME_CHANGE);
  }
}

export default DatePicker;
