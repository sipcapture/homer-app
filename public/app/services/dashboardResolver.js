var dashboardResolver = function () {

  var widgets = {};
  var widgetsPath = '';
  var structures = {};

  var messageTemplate = '<div class="alert alert-danger">{}</div>';
  var loadingTemplate = '\
    <div class="progress progress-striped active">\n\
    <div class="progress-bar" role="progressbar" style="width: 100%">\n\
    <span class="sr-only">loading ...</span>\n\
    </div>\n\
    </div>';
  
  var defaultApplyFunction = function(){
    return true;
  };
  
  this.widget = function(name, widget){
  var w = angular.extend({reload: false, frameless: false}, widget);
  if ( w.edit ){
    var edit = {
      reload: true,
      immediate: false,
      apply: defaultApplyFunction
    };
    
    angular.extend(edit, w.edit);
    w.edit = edit;
  }
  
  widgets[name] = w;
    return this;
  };
  
  
  this.widgetsPath = function(path){
    widgetsPath = path;
    return this;
  };
  
  this.getWidgets = function(){
    return widgets;
  };
  
  this.structure = function(name, structure){
    structures[name] = structure;
    return this;
  };
  
  this.messageTemplate = function(template){
    messageTemplate = template;
    return this;
  };
  
  this.loadingTemplate = function(template){
    loadingTemplate = template;
    return this;
  };	
  
  
  this.$get = function () {
    var cid = 0;
    return {		
      widgets: widgets,
      widgetsPath: widgetsPath,
      structures: structures,
      messageTemplate: messageTemplate,
      loadingTemplate: loadingTemplate,
      id: function(){
        return new Date().getTime() + '-' + (++cid);
      },
      idEquals: function(id, other){
        // use toString, because old ids are numbers
        return ((id) && (other)) && (id.toString() === other.toString());
      }
    };
  };

};

export default dashboardResolver;

