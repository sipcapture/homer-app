import template from './field-proto-display.template.html';

class FieldProtoDisplay {
  constructor() {
    this.scope = {
      fieldProtoDisplay: '=', // import referenced model to our directives scope
      fieldProtoName: '=', // import referenced model to our directives scope
      fieldProtoFormType: '=', // import referenced model to our directives scope
      fieldProtoHeaders: '=',
      fieldProtoHepid: '=',
      fieldProtoHepProfile: '=',
      fieldProtoType: '=',
      fieldProtoFieldName: '=',
    };
    this.template = template;
    this.link = this.linkFunc;
  }

  linkFunc(scope) {
    scope.selectedItem = {
      name: scope.fieldProtoName,
      selection: scope.fieldProtoDisplay,
      form_type: scope.fieldProtoFormType,
      field_name: scope.fieldProtoFieldName,
      type: scope.fieldProtoType,
      hepid: scope.fieldProtoHepid,
      profile: scope.fieldProtoHepProfile,
    };
    scope.$watch('selectedItem', function(val) {
      console.log('JA', val);
      scope.fieldProtoDisplay = val.selection;
      scope.fieldProtoName = val.name;
      scope.fieldProtoFormType = val.form_type;
      scope.fieldProtoHepid = val.hepid;
      scope.fieldProtoHepProfile = val.profile;
      scope.fieldProtoType = val.type;
      scope.fieldProtoFieldName = val.field_name;
    }, true);
  }
}

export default FieldProtoDisplay;
