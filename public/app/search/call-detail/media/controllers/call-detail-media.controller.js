import * as d3 from 'd3';

// style
import 'vis/dist/vis.css';
import 'nvd3/build/nv.d3.css';

class CallDetailMedia {
  constructor($log, EventBus) {
    'ngInject';
    this.$log = $log;
    this.EventBus = EventBus;
    this.d3chart = {
      data: {},
      stats: {},
    };
    this.options = {
      chart: {
        type: 'lineChart',
        height: 250,
        margin: {
          top: 40,
          right: 20,
          bottom: 40,
          left: 55,
        },
        useInteractiveGuideline: false,
        xAxis: {
          tickFormat: function(d) {
            return d3.time.format('%H:%M')(new Date(d * 1000));
          },
        },
        yAxis: {
          tickFormat: function(d) {
            return d3.format('.02f')(d);
          },
          axisLabelDistance: -10,
        },
        showLegend: true,
      },
    };
  }

  $onInit() {
  }

  refresh() {
    this.EventBus.refreshChart();
    this.EventBus.resizeNull();
  }

  callbackD3(scope) {
    this.apiD3[scope.$id] = scope.api;
  }
}

export default CallDetailMedia;
