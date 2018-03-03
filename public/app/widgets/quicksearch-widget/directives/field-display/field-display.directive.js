import template from './field-display.template.html';

class FieldDisplay {
  constructor() {
    this.scope = {
      fieldDisplay: '=', // import referenced model to our directives scope
      fieldName: '=', // import referenced model to our directives scope
      fieldHeaders: '=',
    };
    this.template = template;
    this.link = this.linkFunc;
  }

  linkFunc(scope) {
    scope.selectedItem = {name: scope.fieldName, selection: scope.fieldDisplay};
    scope.$watch('selectedItem', function(val) {
      scope.fieldDisplay = val.selection;
      scope.fieldName = val.name;
    }, true);
  }
}

export default FieldDisplay;
