import template from './templates/influxdbchart-widget.template.html';
import controller from './controllers/influxdbchart-widget.controller';

const influxdbchartWidget = {
  bindings: {
    widget: '<',
    onDelete: '&',
    onUpdate: '&',
  },
  controller,
  template,
};

export default influxdbchartWidget;
