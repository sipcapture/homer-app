/* global angular, document, window*/
/**
 * homerModal - An angularJS modal directive / service with multiple window, resizing and draggable
 * @version v0.0.1
 * @license AGPLv2
 * @author Alexandr Dubovikov <alexandr.dubovikov@gmail.com>
 *
 * Based on ocModal
 * @author Olivier Combe <olivier.combe@gmail.com>
 */
(function() {
  'use strict';

  var homerModal = angular.module('homer.modal', []);
  homerModal.factory('$homerModal', [
    '$rootScope',
    '$controller',
    '$location',
    '$timeout',
    '$compile',
    '$sniffer',
    '$q',
    function($rootScope, $controller, $location, $timeout, $compile, $sniffer, $q) {
      var $body = angular.element(document.body),
        $dialogsWrapper = angular.element('<div role="dialog" tabindex="-1" class="modal2"></div>'),
        $modalWrapper = angular.element('<div class="modal-wrapper"></div>'),
        modals = {},
        openedModals = [],
        baseOverflow;

      // include the modal in DOM at start for animations
      $modalWrapper.css('display', 'none');
      $modalWrapper.append($dialogsWrapper);
      $body.append($modalWrapper);
      $dialogsWrapper.on('click', function(e) {
        if (angular.element(e.target).hasClass('modal-backdrop')) { // only if clicked on backdrop
          $rootScope.$apply(function() {
            self.closeOnEsc();
          });
        }
        e.stopPropagation();
      });

      var parseMaxTime = function parseMaxTime(str) {
        var total = 0,
          values = angular.isString(str) ? str.split(/\s*,\s*/) : [];
        angular.forEach(values, function(value) {
          total = Math.max(parseFloat(value) || 0, total);
        });
        return total;
      };

      var getAnimDuration = function getDuration($element) {
        var duration = 0;
        if (($sniffer.transitions || $sniffer.animations)) {
          //one day all browsers will have these properties
          var w3cAnimationProp = 'animation';
          var w3cTransitionProp = 'transition';

          //but some still use vendor-prefixed styles
          var vendorAnimationProp = $sniffer.vendorPrefix + 'Animation';
          var vendorTransitionProp = $sniffer.vendorPrefix + 'Transition';

          var durationKey = 'Duration',
            delayKey = 'Delay',
            animationIterationCountKey = 'IterationCount';

          //we want all the styles defined before and after
          var ELEMENT_NODE = 1;
          angular.forEach($element, function(element) {
            if (element.nodeType == ELEMENT_NODE) {
              var elementStyles = window.getComputedStyle(element) || {};

              var transitionDelay = Math.max(parseMaxTime(elementStyles[w3cTransitionProp + delayKey]),
                parseMaxTime(elementStyles[vendorTransitionProp + delayKey]));

              var animationDelay = Math.max(parseMaxTime(elementStyles[w3cAnimationProp + delayKey]),
                parseMaxTime(elementStyles[vendorAnimationProp + delayKey]));

              var transitionDuration = Math.max(parseMaxTime(elementStyles[w3cTransitionProp + durationKey]),
                parseMaxTime(elementStyles[vendorTransitionProp + durationKey]));

              var animationDuration = Math.max(parseMaxTime(elementStyles[w3cAnimationProp + durationKey]),
                parseMaxTime(elementStyles[vendorAnimationProp + durationKey]));

              if (animationDuration > 0) {
                animationDuration *= Math.max(parseInt(elementStyles[w3cAnimationProp + animationIterationCountKey]) || 0,
                  parseInt(elementStyles[vendorAnimationProp + animationIterationCountKey]) || 0, 1);
              }

              duration = Math.max(animationDelay + animationDuration, transitionDelay + transitionDuration, duration);
            }
          });
        }

        // REMOVE??
        return duration * 1000;
      };

      angular.element(document).on('keyup', function(e) {
        if (e.keyCode == 27 && openedModals.length > 0) {
          e.stopPropagation();
          $rootScope.$apply(function() {
            self.closeOnEsc(openedModals[openedModals.length - 1]);
          });
        }
      });

      var self = {
        waitingForOpen: false,

        getOpenedModals: function() {
          return openedModals;
        },

        register: function(params) {
          modals[params.id || '_default'] = params;
        },

        remove: function(id) {
          delete modals[id || '_default'];
        },

        open: function(opt, callback) {
          if (typeof opt === 'string') {
            if (opt.match('<')) { // if html code
              opt = {
                template: opt
              };
            } else {
              opt = {
                url: opt
              };
            }
          }
          var modal = modals[opt.id || '_default'];
          if (!modal) {
            $dialogsWrapper.append($compile('<div homer-modal="' + (opt.id ? opt.id : '_default') + '"></div>')($rootScope));
            $timeout(function() { // let the ng-include detect that it's now empty
              self.open(opt);
            });
            return;
          } else if (modal && openedModals.indexOf(opt.id || '_default') !== -1) { // if modal already opened
            if (self.waitingForOpen) {
              return;
            }
            self.waitingForOpen = true;
            self.close(opt.id).then(function() {
              self.open(opt);
            });
            return;
          }
          // ok let's open the modal
          if (!self.waitingForOpen) {
            if (openedModals.length === 0) { // if no modal opened
              baseOverflow = document.body.style.overflow;
              document.body.style.overflow = 'hidden';
              $modalWrapper.css('display', 'block');
            } else {
              for (var i = 0, len = openedModals.length; i < len; i++) {
                var $e = modals[openedModals[i]].$element;
                modals[openedModals[i]].baseZIndex = $e.css('z-index');
                $e.css('z-index', '-1');
                $e.addClass('no-backdrop');
              }
            }
          }
          self.waitingForOpen = false;
          openedModals.push(opt.id || '_default');
          modal.params = opt;
          modal.$scope.customClass = modal.params.cls;
          modal.$scope.customId = opt.id ? opt.id : '_default';
          modal.$scope.divLeft = opt.divLeft ? opt.divLeft : '100px';
          modal.$scope.divTop = opt.divTop ? opt.divTop : '100px';
          if (opt.component) {
            modal.$scope.bindings = {
              id: modal.$scope.customId,
              internal: opt.internal,
              params: opt.params,
              sdata: opt.sdata,
            };
          }

          // timeout for animations (if any)
          //$rootScope.$digest();
          $body[0].offsetWidth; // force paint to be sure the element is in the page
          $timeout(function() {
            modal.$scope.modalShow = true;
          }, 100);

          if (typeof modal.params.onOpen === 'function') {
            modal.params.onOpen();
          }

          var off = modal.$scope.$on('$includeContentLoaded', function(event) { // on view load
            if (modal.params.init && !modal.params.isolate) {
              angular.extend(event.targetScope, modal.params.init);
            }
            if (typeof modal.params.controller === 'string') {
              $controller(modal.params.controller, {
                $scope: event.targetScope,
                $init: modal.params.init,
                $homerModalParams: modal.params
              }); // inject controller
            }
            off();
          });

          if (modal.params.template) {
            modal.$scope.modalTemplate = modal.params.template; // load the view
          } else if (modal.params.url) {
            modal.$scope.modalUrl = modal.params.url; // load the view
          } else {
            throw 'You need to define a template or an url';
          }

          if (typeof callback === 'function') {
            modal.$scope.callbacksList.push(callback);
          }

          if (typeof modal.params.onOpen === 'function') {
            modal.params.onOpen();
          }
        },

        closeOnEsc: function(id) {
          if (modals[id || openedModals[openedModals.length - 1]].params.closeOnEsc !== false) {
            return self.close(id);
          }
        },

        close: function(id) {
          var args,
            deferred = $q.defer();
          if (typeof id === 'string' && openedModals.indexOf(id) !== -1) {
            args = Array.prototype.slice.call(arguments, 1);
          } else {
            args = arguments;
          }
          if (typeof id === 'undefined' || openedModals.indexOf(id) === -1) {
            id = openedModals[openedModals.length - 1];
          }
          var modal = modals[id || openedModals[openedModals.length - 1]];
          if (modal && modal.$scope.modalShow === true) { // if the modal is opened
            var animDuration = getAnimDuration(angular.element(modal.$element[0].querySelector('.modal-content')));
            $timeout(function() {
              modal.$scope.modalShow = false;

              $timeout(function() {
                modal.$scope.$destroy();
                modal.$element.remove(); // destroy the modal

                modal.callbacksList = []; // forget all callbacks
                openedModals.splice(openedModals.indexOf(id || openedModals[openedModals.length - 1]), 1);
                if (openedModals.length === 0) { // if no modal left opened
                  if (!self.waitingForOpen) { // in case the current modal is closed because another opened with the same id (avoid backdrop flickering in firefox)
                    document.body.style.overflow = baseOverflow; // restore the body overflow
                    $modalWrapper.css('display', 'none');
                  }
                } else {
                  var topModal = modals[openedModals[openedModals.length - 1]];
                  topModal.$element.css('z-index', topModal.baseZIndex);
                  topModal.$element.removeClass('no-backdrop');
                }
                if (typeof modal.params.onClose === 'function') {
                  modal.params.onClose.apply(undefined, args);
                }

                deferred.resolve();
              }, animDuration);
            });
          } else {
            deferred.resolve();
          }
          return deferred.promise;
        }
      };

      return self;
    }
  ]);

  homerModal.directive('homerModal', ['$homerModal', '$compile', '$rootScope', function($homerModal, $compile, $rootScope) {
    return {
      restrict: 'AE',
      replace: true,
      scope: true,
      //transclude: true,
      //scope: {},
      template: '<div>' +
        '<div draggable class="modal-content {{customClass}}" ng-class="{opened: modalShow}" ng-if="modalTemplate"></div>' +
        '<div draggable id="{{customId}}" class="modal-content {{customClass}}" ng-class="{opened: modalShow}" ng-include="modalUrl" style="top: {{divTop}}; left: {{divLeft}}"></div>' +
        '</div>',


      link: function link($scope, $element, $attrs) {
        var id = $attrs.homerModal,
          $templateWrapper;

        $scope.closeModal = function() {
          var args = Array.prototype.slice.call(arguments);
          args.unshift(id);
          $homerModal.close.apply(undefined, args);
        };

        $homerModal.register({
          id: id,
          $scope: $scope,
          $element: $element
        });

        $element.on('$destroy', function() {
          $homerModal.remove(id);
        });

        $scope.$watch('modalTemplate', function(newVal) {
          if (typeof newVal !== 'undefined') {
            if (!$templateWrapper) {
              $templateWrapper = angular.element($element.children()[0]);
            }
            $templateWrapper.append($compile(newVal)($scope));
            $rootScope.$broadcast('$includeContentLoaded');
          }
        });
      }
    };
  }]);

  homerModal.directive('homerModalOpen', ['$homerModal', function($homerModal) {
    return {
      restrict: 'A',
      require: '?modal',
      link: function($scope, $element, $attrs) {
        $element.on('click touchstart', function(e) {
          e.preventDefault();
          e.stopPropagation();
          var newScope = $scope.$new();
          var params = newScope.$eval($attrs.homerModalOpen);
          if (params) {
            if (typeof params === 'number') {
              params = {
                url: $attrs.homerModalOpen
              };
            } else if (typeof params === 'string') {
              params = {
                url: params
              };
            }
            if (!params.url) {
              throw 'You need to set the modal url';
            }
            $scope.$apply(function() {
              $homerModal.open(params);
            });
          }
        });
      }
    };
  }]);
})();
