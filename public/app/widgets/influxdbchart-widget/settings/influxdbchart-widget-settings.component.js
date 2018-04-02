import template from './templates/influxdbchart-widget-settings.template.html';
import controller from './controllers/influxdbchart-widget-settings.controller';

const influxdbchartWidgetSettings = {
  bindings: {
    modalInstance: '<',
    resolve: '<',
  },
  controller,
  template,
};

export default influxdbchartWidgetSettings;
