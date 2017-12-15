    var injectpwCheckParams = [];
    var hepicpwCheckDirective = function () {
	 return {
              require: 'ngModel',
              link: function (scope, elem, attrs, ctrl) {
                var firstPassword = '#' + attrs.pwCheck;

                elem.add(firstPassword).on('keyup', function () {
                  scope.$apply(function () {
                    var v = elem.val()===$(firstPassword).val();
                    ctrl.$setValidity('pwmatch', v);
                  });
                });
              }
        }
    };

    hepicpwCheckDirective.$inject = injectpwCheckParams;
export default hepicpwCheckDirective;
