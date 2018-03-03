import angular from 'angular';
import Draggable from './draggable.directive';

export default angular.module('hepicApp.draggable', []).directive('draggable', /* @ngInject */ () => new Draggable());
