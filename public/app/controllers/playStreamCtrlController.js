    /* next*/    
    var injectPlayStreamCtrlParams = ['$scope','searchService','$homerModal','$timeout', '$homerModalParams', '$sce','userProfile','$q'];    
    var PlayStreamCtrlController = function ($scope, searchService, $homerModal, $timeout, $homerModalParams, $sce, userProfile, $q) {    

                var data = $homerModalParams.params;
                
                var internal = $homerModalParams.internal;
                //internal = true;
                // console.log("PLAYBACK: ",$homerModalParams.sdata);
		$scope.sdata = $homerModalParams.sdata;
                $scope.dataLoading =  false;
                $scope.false = true;

		var getCallIDColor = function(str) {
        	    var hash = 0;
        	    for (var i = 0; i < str.length; i++) {
        	        hash = str.charCodeAt(i) + ((hash << 5) - hash);
        	    }
        	    i = hash;
        	    var col = ((i >> 24) & 0xAF).toString(16) + ((i >> 16) & 0xAF).toString(16) +
        	        ((i >> 8) & 0xAF).toString(16) + (i & 0xAF).toString(16);
        	    if (col.length < 6) col = col.substring(0, 3) + '' + col.substring(0, 3);
        	    if (col.length > 6) col = col.substring(0, 6);
		    return '#'+col;
		}
		
		var readyWave = function() {
		    console.log("JOPA");
		    searchService.searchMetaDataRecording($scope.sdata.id).then(function(sdata) {		            
		            console.log("RETURN", sdata);
		            $scope.infostream = sdata;
                        },
                        function(sdata) {
                            return;
                    }).finally(function() {

                    });		    
                };
		                             		

		$scope.options = {
	            waveColor      : $scope.waveColor,
		    progressColor  : '#2A9FD6',
		    normalize      : true,
		    hideScrollbar  : true,
		    skipLength     : 15,
		    height         : 53,
		    cursorColor    : '#FFFFFF',
		    callback	   : readyWave
		};
	
		console.log("MYDATA", $scope.sdata);
		
		$scope.url = '/api/v2/call/recording/play/'+$scope.sdata.id;		
		$scope.paused = true;
		$scope.waveColor = getCallIDColor($scope.sdata.correlation_id),
		
		$scope.ready = true;

		/*
		wavesurfer.on('ready', function () {
		        
		        console.log("READY");
		        search.searchMetaDataRecording($scope.sdata.id).then(function(sdata) {

                        },
                        function(sdata) {
                            return;
                    }).finally(function() {

                    });
                });
                */


		// cancel interval on scope destroy
		$scope.$on('$destroy', function(){
                      console.log("lets destroy all objects!");
            	});		
    };

    PlayStreamCtrlController.$inject = injectPlayStreamCtrlParams;

export default PlayStreamCtrlController; 
