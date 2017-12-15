/* VARIABLES */
var DEBUG = true;
var USER_EXT_CR = false;
var WEBSOCKET = false;
var HEPIC_VERSION = "2.1.11";
document.title = "HEPIC "+HEPIC_VERSION;

if(!DEBUG){
    if(!window.console) window.console = {};
    var methods = ["log", "debug", "warn", "info"];
    for(var i=0;i<methods.length;i++){
    console[methods[i]] = function(){};
    }   
};
