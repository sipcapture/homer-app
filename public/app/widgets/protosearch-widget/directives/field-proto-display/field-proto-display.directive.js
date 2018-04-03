import template from './field-proto-display.template.html';

class FieldProtoDisplay {
  constructor() {
    this.scope = {
      fieldProtoDisplay: '=', // import referenced model to our directives scope
      fieldProtoName: '=', // import referenced model to our directives scope
      fieldProtoHeaders: '=',
    };
    this.template = template;
    this.link = this.linkFunc;
  }

  linkFunc(scope) {
    scope.selectedItem = {name: scope.fieldProtoName, selection: scope.fieldProtoDisplay};
    scope.$watch('selectedItem', function(val) {
      scope.fieldProtoDisplay = val.selection;
      scope.fieldProtoName = val.name;
    }, true);
  }
}

export default FieldProtoDisplay;
