class TimeMachine {
  constructor() {
    this.timezone = {
      value: new Date().getTimezoneOffset(),
      name: 'Default',
    };
    this.timerange = {
      from: new Date(new Date().getTime() - 900*1000),
      to: new Date(),
      custom: 'Today',
    };
  }

  // to-do: add methods to store timezone and timerange in DB
  setTime(data) {
    if (data.timezone) {
      this.timezone = data.timezone;
    }
    if (data.timerange) {
      this.timerange = data.timerange;
    }
  }

  setTimezone(timezone) {
    this.timezone = timezone;
  }

  setTimerange(timerange) {
    this.timerange = timerange;
  }

  getTime() {
    return {
      timezone: this.timezone,
      timerange: this.timerange,
    };
  }

  getTimezone() {
    return this.timezone;
  }

  getTimerange() {
    return this.timerange;
  }
}

export default TimeMachine;
