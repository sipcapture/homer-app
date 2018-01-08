import data_timezones from '../../data/timezones';

class CustomRange {

  constructor() {
    this.timezones = data_timezones;
    this.time = {
      hstep: 1,
      mstep: 1,
      sstep: 1
    };
    this.date = {
      isOpen: {
        from: false,
        to: false
      },
      format: 'yyyy/MM/dd',
      min: new Date().setFullYear(2013, 0, 1),
      max: new Date().setFullYear(2032, 0, 1),
      options: {
        formatYear: 'yy',
        startingDay: 1,
        showWeeks: false
      }
    };
  }

  getNowDate(field, timezone) {
    const diff = (new Date().getTimezoneOffset() - timezone);
    if (field === 'to') {
      return {
        to: new Date().setMinutes(new Date().getMinutes() + diff)
      };
    }
    return {
      from: new Date().setMinutes(new Date().getMinutes() + diff)
    };
  }

  openCalendar(field) {
    this.date.isOpen[field] = !this.date.isOpen[field];
  }

}

export default CustomRange;
