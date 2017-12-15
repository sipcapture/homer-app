    var injectParams = [];

    var appFilter = function () {
	        return function(input) {
	                var i = 0;
	                var out = [];
        	        for (i in input) {
                	        out.push(input[i]);
	                }
        	        return out;
	        }
    };

    appFilter.$inject = injectParams;

    //app.filter('object2Array', appFilter);
export default appFilter;
