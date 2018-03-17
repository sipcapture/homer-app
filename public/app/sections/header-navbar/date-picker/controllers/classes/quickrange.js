import dataQuickrangeOptions from '../../data/quickrange_options';

class QuickRange {
  constructor() {
    this.options = {
      left: dataQuickrangeOptions.slice(0, dataQuickrangeOptions.length/2),
      right: dataQuickrangeOptions.slice(dataQuickrangeOptions.length/2, dataQuickrangeOptions.length),
    };
    this.custom = {
      last: 5, // min
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
    const diff = new Date().getTimezoneOffset() - timezone;
    const bdt = new Date(new Date().setMinutes(new Date().getMinutes() + min + diff));
    const sdt = new Date(new Date().setMinutes(new Date().getMinutes() + min + diff));
    bdt.setHours(0, 0, 0, 0);
    sdt.setHours(23, 59, 59, 99);
    return {
      from: bdt,
      to: sdt,
      custom: text,
    };
  }

  getNext(min, text, timezone) {
    const diff = new Date().getTimezoneOffset() - timezone;
    return {
      from: new Date(new Date().setMinutes(new Date().getMinutes() + diff)),
      to: new Date(new Date().setMinutes(new Date().getMinutes() + min + diff)),
      custom: text,
    };
  }

  getLast(value, title, timezone) {
    const diff = new Date().getTimezoneOffset() - timezone;
    return {
      from: new Date(new Date().setMinutes(new Date().getMinutes() - value + diff)),
      to: new Date(new Date().setMinutes(new Date().getMinutes() + diff)),
      custom: title,
    };
  }
}

export default QuickRange;
