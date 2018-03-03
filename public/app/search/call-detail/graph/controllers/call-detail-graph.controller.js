import * as d3 from 'd3';

class CallDetailGraph {
  constructor($log) {
    'ngInject';
    this.$log = $log;
    this.LiveGraph = [];
    this.LiveGraph.data = {
      nodes: [],
      links: [],
    };
    this.getColor = d3.scale.category20();
    this.LiveGraph.options = {
      chart: {
        type: 'forceDirectedGraph',
        margin: {
          top: 20,
          right: 20,
          bottom: 20,
          left: 20,
        },
        height: 400,
        width: 400,

        linkStrength: 0.1,
        friction: 0.3,
        linkDist: 250,
        gravity: 0.2,
        charge: -300,
        radius: 20,

        background: '#fff',
        color: function(d) {
          return this.getColor(d.name);
        },
        tooltip: {
          contentGenerator: function() {
            return '<div></div>';
          },
        },
        nodeExtras: function(node) {
          node && node
            .append('text')
            .attr('dx', 24)
            .attr('dy', '.38em')
            .attr('text-anchor', 'top')
            .text(function(d) {
              return (d.type ? d.type + ' ' : '') + d.name;
            })
            .style('font-size', '12px');
        },
      },
    };
  }

  $onInit() {
  }

  callbackD3(scope) {
    this.apiD3[scope.$id] = scope.api;
  }
}

export default CallDetailGraph;
