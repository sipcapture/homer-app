import 'json-editor';

class JsonEditor {
  constructor() {
    this.restrict = 'E',
    this.scope = {
      jsonEditorSchema: '<',
      jsonEditorData: '<',
      jsonEditorTrigger: '=',
      jsonEditorPersist: '&',
    };
    this.template = '<div id="json-editor-placeholder"></div>';
    this.link = this.linkFunc;
  }

  linkFunc(scope) {
    const editorElement = document.getElementById('json-editor-placeholder');

    const editor = new JSONEditor(editorElement, {
      theme: 'barebones',
      schema: scope.jsonEditorSchema,
    });
    
    editor.setValue(scope.jsonEditorData);

    scope.$on('$destroy', function() {
      scope.jsonEditorPersist({data: editor.getValue()});
    });

    scope.jsonEditorTrigger.save = function() {
      scope.jsonEditorPersist({data: editor.getValue()});
    };
  }
}

export default JsonEditor;
