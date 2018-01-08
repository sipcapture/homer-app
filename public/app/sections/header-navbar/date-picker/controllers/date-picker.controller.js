import '../style/date-picker.style.css';

import {assign} from 'lodash';
import moment from 'moment';

import QuickRange from './classes/quickrange';
import CustomRange from './classes/customrange';

class DatePicker {

  constructor($log, $rootScope, UserProfile, TimeMachine, EVENTS) {
    'ngInject';
    this.$log = $log;
    this.$rootScope = $rootScope;
    this.UserProfile = UserProfile;
    this.TimeMachine = TimeMachine;
    this.EVENTS = EVENTS;
  }

  $onInit() {
    this.menu = {
      isOpen: false
    };

    const timedata = this.TimeMachine.getTime();
    this.timerange = timedata.timerange;
    this.timezone = timedata.timezone;

    this.quick = new QuickRange();
    this.custom = new CustomRange();
  }

  setNow(field) {
    this.timerange = assign(this.timerange, this.custom.getNowDate(field, this.timezone.value));
  }

  setCustom() {
    const from = moment(this.timerange.from).format('MMM, DD, YYYY HH:mm:ss');
    const to = moment(this.timerange.to).format('MMM, DD, YYYY HH:mm:ss');
    this.timerange.custom = `${from} to ${to}`;
    this.menu.isOpen = false;
    this.TimeMachine.setTime({
      timezone: this.timezone,
      timerange: this.timerange
    });
    this.tellDashboardAboutTimeChange();
  }

  setQuick(option, custom = null) {
    if (custom) {
      this.timerange = assign(this.timerange, this.quick.getLast(option.min, option.text, this.timezone.value));
    } else {
      this.timerange = assign(this.timerange, this.quick.getRange(option, this.timezone.value));
    }
    this.menu.isOpen = false;
    this.TimeMachine.setTime({
      timezone: this.timezone,
      timerange: this.timerange
    });
    this.tellDashboardAboutTimeChange();
  }

  tellDashboardAboutTimeChange() {
    this.$rootScope.broadcast(this.EVENTS.WIDGETS_GLOBAL_RELOAD, 1);
  }

}

export default DatePicker;
