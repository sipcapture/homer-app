import '../styles/angular-json-tree.css';
import 'ace-builds/src-min-noconflict/ace' // Load Ace Editor
import 'ace-builds/src-min-noconflict/theme-chrome'
import 'ace-builds/src-min-noconflict/ext-language_tools'


class CallDetailLoki {
  constructor($scope, $log, SearchService, GlobalProfile, $state, $timeout) {
    'ngInject';
    this.log = $log;    
    this.GlobalProfile = GlobalProfile;
    this.SearchService = SearchService;
    this.$state = $state;
    this.$scope = $scope;
    this.$timeout =  $timeout;
            
    var that = this;
    
    this.getLokiServer = function() {
          var lokiServer = this.GlobalProfile.getProfileCategory("search","lokiserver");
          return (lokiServer && lokiServer.host) ? lokiServer.host : 'http://127.0.0.1:3100';
    };
                            
    $scope.aceOptions = {
        advanced:{
		maxLines: 1,
		minLines: 1,
		showLineNumbers: false,
	 	showGutter: false,
		fontSize: 15,
        	enableBasicAutocompletion: true,
                enableSnippets: false,
                enableLiveAutocompletion: true,
                autoScrollEditorIntoView: true,
        },
        onLoad: function(editor, session){
        	var langTools = ace.require("ace/ext/language_tools");  
        	var gprefix = "test";

        	editor.container.style.lineHeight = 2;
        	editor.renderer.updateFontSize();

		var wServer = that.getLokiServer(); // fetch widget server configuration		

		var labelCompleter = {
     		   getCompletions: function(editor, session, pos, prefix, callback) {

		    var api = "/api/v3/search/remote/label?server="+wServer;

        	    $.getJSON( api,
		    function(wordList) {
                    	var labels = [];
	                    wordList.forEach(val => labels.push({word: val, score: 1 }))
        	            // console.log('got labels',labels);
	                    callback(null, labels.map(function(ea) {
        	                return {name: ea.word, value: ea.word, score: ea.score, meta: "label"}
                	    }));
	                })
        	    }
		};
		langTools.addCompleter(labelCompleter);		

		var valueCompleter = {
     		   getCompletions: function(editor, session, pos, prefix, callback) {     		    
	            if (gprefix.length === 0) { callback(null, []); return }
		    var api = "/api/v3/search/remote/values?label="+gprefix+"&server="+wServer;
        	    $.getJSON( api,
		    function(wordList) {
                    	var values = [];
	                    wordList.forEach(val => values.push({word: val, score: 1 }))
        	            // console.log('got values',values);
	                    callback(null, values.map(function(ea) {
        	                return {name: ea.word, value: '"'+ea.word+'"', score: ea.score, meta: "value"}
                	    }));
	                })
        	    }
		};

	    	editor.commands.addCommand({
	                name: "getValues",
	                bindKey: { win: "=", mac: "=" },                
	                exec: function(editor,command) {
	                    var position = editor.getCursorPosition();
	                    var token = editor.session.getTokenAt(position.row, position.column);
	                    var valueData = token.value.substring(0, position.column);	                	                    	                    
	                    var arrStr = valueData.split(/[=\ {}]/).reverse();
	                    for (var i = 0; i < arrStr.length; i++) {	                              
                                    if(arrStr[i].length != 0 ) {
                                        gprefix = arrStr[i];
                                        break;
                                    }	                            
	                    };	                    
	                    editor.insert(" = ");
	                    if (!editor.completer) editor.completer = new Autocomplete(editor); 
	                    editor.completers = [valueCompleter];                  
	                    editor.execCommand("startAutocomplete");
	                    //editor.completer.showPopup(editor); 
	                }
	    	});   
    
	    
	    	editor.commands.on('afterExec', event => {
	    	   const { editor, command } = event;
	    	   	    	                    
	    	   if (event.command.name == "insertstring")
	    	   {
	    	           if (event.args != "}" && event.args != " ") 
	    	           {
	    	               editor.execCommand("startAutocomplete");
	    	               editor.completers = [labelCompleter];
                           }
	    	   }
	    	   if (event.command.name == "insertMatch") {
			 editor.completers = [labelCompleter];			                                
		   }
		});
        }
    }                    
  }
  
  
  $onInit() {

      /* has to be fixed as forEach */
      var callId = this.$scope.$ctrl.lokireport.param.search['1_call']['callid'].join('|');
      this.searchParams = '{job = "heplify-server"} ' +callId;
  }

  createQuery() {
    let { param, timestamp } = this.$scope.$ctrl.lokireport;

    const query = {
      param: {},
      timestamp: timestamp
    };

    this.log.debug('time from:', query.timestamp.from, new Date(query.timestamp.from));
    this.log.debug('time to:', query.timestamp.to, new Date(query.timestamp.to));    

    /* preference processing */
    /* make construct of query */
    query.param.limit = param.limit ? param.limit : 300;
    query.param.timezone = param.timezone;
    query.param.search = this.searchParams;

    return query;
  }

  async processSearchResult() {
  
    const query = this.createQuery();

    try {

      const response = await this.SearchService.searchRemoteByParam(query);

      const { data, keys } = response.data;

      console.log("DATA", data);
      
      this.$scope.$ctrl.lokidata = data;

      this.$timeout(() => {
        angular.element(this.$window).resize();
      }, 200);
    } catch (err) {
      this.log.error(err);
    }
  }
  
  async processRefreshSearchResult() {
  

        console.log("RRR", this.$scope);
        console.log("ARR", this.searchParams);        
	this.processSearchResult();
  }
  
}

export default CallDetailLoki;
