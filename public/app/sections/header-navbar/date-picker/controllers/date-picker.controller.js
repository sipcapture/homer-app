import '../style/date-picker.style.css';
import data_quickrange_options from '../data/quickrange_options';

class DatePicker {

  constructor($log) {
    'ngInject';
    this.$log = $log;
  }

  $onInit() {
    this.datepicker = {
      title: 'select time range',
      isOpen: false,
      quickrange: {
        options: {
          left: data_quickrange_options.slice(0, data_quickrange_options.length/2),
          right: data_quickrange_options.slice(data_quickrange_options.length/2, data_quickrange_options.length)
        }
      }
    };
  }

  openDatepicker() {}

  enableOption() {}
  
}

export default DatePicker;
