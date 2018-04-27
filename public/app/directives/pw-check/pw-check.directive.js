class PwCheck {
  constructor() {
    this.restrict = 'E',
    this.require = 'ngModel';
    this.link = this.linkFunc;
  }

  linkFunc(scope, elem, attrs, ctrl) {
    const firstPassword = '#' + attrs.pwCheck;
    
    elem.add(firstPassword).on('keyup', function() {
      scope.$apply(function() {
        const v = elem.val()===$(firstPassword).val();
        ctrl.$setValidity('pwmatch', v);
      });
    });
  }
}

export default PwCheck;
