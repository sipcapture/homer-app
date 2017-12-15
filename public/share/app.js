/*
 * HEPIC
 *
*/

(function (angular, hepic) {
    'use strict';
     var app = angular.module('hepicApp', [
        'ui.bootstrap',
        'wavesurfer.angular',
        'oitozero.ngSweetAlert',
        'ngAnimate',
        'ngCookies',
        'ui.select',
        'inputDropdown',
        'ngSanitize',
        'dialogs.main',
        'homer.modal',
        'homer.cflow',
        'smart-table',
        'nvd3',
        'ui-leaflet',
        'hepicCore',
        'ngFitText'
    ]);
        
}(angular, hepic));


String.prototype.hashCode = function() {
  var hash = 0, i, chr, len;
  if (this.length == 0) return hash;
  for (i = 0, len = this.length; i < len; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; 
  }
  return hash;
};