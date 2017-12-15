    var injectModalParams = [];
    var hepicModalDirective = function () {
		  return {
                      template: '<div class="modal fade">' +
                          '<div class="modal-dialog">' +
                            '<div class="modal-content">' +
                              '<div class="modal-header">' +
                                '<button type="button" class="close" data-dismiss="modal" aria-hidden="true"><img src="img/Close.svg" alt=""></button>' +
                                '<h4 class="modal-title">{{ title }}</h4>' +
                              '</div>' +
                              '<div class="modal-body" ng-transclude></div>' +
                            '</div>' +
                          '</div>' +
                        '</div>',
                     restrict: 'E',
                     transclude: true,
                     replace:true,
                     scope:true,
                     link: function postLink(scope, element, attrs) {
                        scope.title = attrs.title;
                        scope.$watch(attrs.visible, function(value){
                                  if(value == true) $(element).modal('show');
                                  else $(element).modal('hide');
                        });

                        $(element).on('shown.bs.modal', function(){
                                scope.$apply(function(){
                                    scope.$parent[attrs.visible] = true;
                                });
                        });

                        $(element).on('hidden.bs.modal', function(){
                                 scope.$apply(function(){
                                        scope.$parent[attrs.visible] = false;
                                 });
                        });
                    }
               };
    };

    hepicModalDirective.$inject = injectModalParams;
export default hepicModalDirective;
