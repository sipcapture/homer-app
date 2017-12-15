    var injectMessageSearchParams = [];
    var appMessageSearchFilter = function () {
		 return function(data, grid, query) {
                    var matches = [];

                    //no filter defined so bail
                    if (query === undefined|| query==='') {
                      return data;
                    }

                    for (var i = 0; i < data.length; i++) {
                              for (var j = 0; j < grid.columnDefs.length; j++) {

                                        var dataItem = data[i];
                                        var fieldName = grid.columnDefs[j]['field'];

                                        if(dataItem[fieldName] === undefined) continue;

                                        if (dataItem[fieldName].toString().search(query)>-1) {
                                                 var n = dataItem[fieldName].toString().search(query);
                                                 matches.push(dataItem);
                                                 break;
                                        }
                                }
                    }
                    return matches;
              }

    };

    appMessageSearchFilter.$inject = injectMessageSearchParams;
export default appMessageSearchFilter;    
