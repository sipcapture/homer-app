class TimeMachine {
  constructor() {
    this.timezone = {
      value: new Date().getTimezoneOffset(),
      name: 'Default',
    };
    this.timerange = {
      from: new Date(this.getStartOfDay(this.timezone.value)),
      to: new Date(this.getNowTime(this.timezone.value)),
      custom: 'Today',
    };
  }

  /**
  * Get time from today start
  *
  * @param {integer} offset for timezone (min)
  * @return {integer} num of ms since 1970/01/01 till today start
  */
  getStartOfDay(offset = 0) {
    return new Date().setHours(0, 0, 0, 0) - offset * 60000;
  }

  /**
  * Get now time
  *
  * @param {integer} offset for timezone (min)
  * @return {integer} num of ms since 1970/01/01 till now
  */
  getNowTime(offset = 0) {
    return new Date().getTime() - offset * 60000;
  }

  /**
  * Shift time
  *
  * @param {integer} value to shift for (ms)
  */
  shiftTime(value) {
    this.timerange.from = new Date(this.timerange.from.getTime() + value);
    this.timerange.to = new Date(this.timerange.to.getTime() + value);
  }

  /**
  * Set time zone
  *
  * @param {object} timezone
  */
  setTimezone(timezone) {
    this.timezone = timezone;
  }

  /**
  * Set time range
  *
  * @param {object} timerange
  */
  setTimerange(timerange) {
    this.timerange = timerange;
  }

  getTimezone() {
    return this.timezone;
  }

  getTimerange() {
    return this.timerange;
  }
}

export default TimeMachine;
