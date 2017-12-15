    var injectTSParams = [];
    var appTSFilter = function () {
           return function(input) {
               if (!input){
                   return '';
               } else {
                   return input;
               }
           };                                                                                       
    };

    appTSFilter.$inject = injectTSParams;
export default appTSFilter;    
