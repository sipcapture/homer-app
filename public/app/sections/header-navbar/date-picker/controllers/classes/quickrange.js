import data_quickrange_options from '../../data/quickrange_options';

class QuickRange {

  constructor() {
    this.options = {
      left: data_quickrange_options.slice(0, data_quickrange_options.length/2),
      right: data_quickrange_options.slice(data_quickrange_options.length/2, data_quickrange_options.length)
    };
  }

  getRange(option, timezone) {
    if (option.type === 'day') {
      return this.getDay(option.value, option.title, timezone);
    }
    if (option.type === 'next') {
      return this.getNext(option.value, option.title, timezone);
    }
    return this.getLast(option.value, option.title, timezone);
  }

  getDay(day, text, timezone) {
    const min = day * 1440;
    const diff = (new Date().getTimezoneOffset() - timezone);
    const bdt = new Date(new Date().setMinutes(new Date().getMinutes() + min + diff));
    const sdt = new Date(new Date().setMinutes(new Date().getMinutes() + min + diff));
    bdt.setHours(0, 0, 0, 0);
    sdt.setHours(23, 59, 59, 99);
    return {
      from: bdt,
      to: sdt,
      custom: text
    };
  }

  getNext(min, text, timezone) {
    const diff = (new Date().getTimezoneOffset() - timezone);
    const dt = new Date(new Date().setMinutes(new Date().getMinutes() + min + diff));
    return {
      from: new Date(new Date().setMinutes(new Date().getMinutes() + diff)),
      to: dt,
      custom: text
    };
  }

  getLast(min, text, timezone) {
    const diff = (new Date().getTimezoneOffset() - timezone);
    const dt = new Date(new Date().setMinutes(new Date().getMinutes() - min + diff));
    return {
      from: dt,
      to: new Date(new Date().setMinutes(new Date().getMinutes() + diff)),
      custom: text
    };
  }
}

export default QuickRange;
