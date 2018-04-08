import template from './field-proto-display.template.html';

class FieldProtoDisplay {
  constructor() {
    this.scope = {
      fieldProtoDisplay: '=', // import referenced model to our directives scope
      fieldProtoName: '=', // import referenced model to our directives scope
      fieldProtoFormType: '=', // import referenced model to our directives scope
      fieldProtoType: '=', // import referenced model to our directives scope
      fieldProtoHeaders: '=',
      fieldProtoFields: '=',
    };
    this.template = template;
    this.link = this.linkFunc;
  }

  linkFunc(scope) {
    scope.selectedItem = {name: scope.fieldProtoName, selection: scope.fieldProtoDisplay};
    scope.$watch('selectedItem', function(val) {
      console.log("JA", val);
      scope.fieldProtoDisplay = val.selection;
      scope.fieldProtoName = val.name;
      scope.fieldProtoFormType = val.form_type;
      scope.fieldProtoFields = val;
    }, true);
  }
}

export default FieldProtoDisplay;
