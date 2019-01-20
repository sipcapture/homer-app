import angular from 'angular';

class AutoFillSync {
  constructor($timeout) {
    this.restrict = 'A',
    this.require = 'ngModel';
    this.link = this.linkFunc;
    this.$timeout = $timeout;
  }

  linkFunc(scope, elem, attrs, ngModel) {
    const origVal = elem.val();
    this.$timeout(() => {
      const newVal = elem.val();
      if (ngModel.$pristine && origVal !== newVal) {
        ngModel.$setViewValue(newVal);
      }
    }, 700);
  }
}

export default angular.module('hepicApp.directives.auto-fill-sync', [])
  .directive('autoFillSync', /* @ngInject */ ($timeout) => new AutoFillSync($timeout));
