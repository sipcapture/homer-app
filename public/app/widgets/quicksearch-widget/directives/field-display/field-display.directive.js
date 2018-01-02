import template from './field-display.template.html';

// to-do: refactor in a component and use in this widget modal settings

const injectParams = [];
const fieldDisplay = function () {
  return {
    scope: {
      fieldDisplay: '=', //import referenced model to our directives scope
      fieldName: '=', //import referenced model to our directives scope
      fieldHeaders: '='
    },
    template,
    link: function(scope) {
      scope.selectedItem = { name: scope.fieldName, selection: scope.fieldDisplay };
      scope.$watch('selectedItem', function(val) {
        scope.fieldDisplay = val.selection;
        scope.fieldName = val.name;
      }, true);
    }
  };
};

fieldDisplay.$inject = injectParams;
export default fieldDisplay;
