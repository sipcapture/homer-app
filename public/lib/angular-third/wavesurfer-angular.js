(function () {
    'use strict';
    
    angular.module('wavesurfer.angular', [])
        .filter('hms', function () {
            return function (str) {
                var sec_num = parseInt(str, 10),
                    hours   = Math.floor(sec_num / 3600),
                    minutes = Math.floor((sec_num - (hours * 3600)) / 60),
                    seconds = sec_num - (hours * 3600) - (minutes * 60);

                if (hours   < 10) { hours   = "0" + hours; }
                if (minutes < 10) { minutes = "0" + minutes; }
                if (seconds < 10) { seconds = "0" + seconds; }

                var time    = minutes + ':' + seconds;

                return time;
            };
        })
        .directive('wavesurferAngular', function ($interval, $window, $parse) {
            var uniqueId = 1;
            return {
                restrict : 'EA',
                scope    : {
                    urlData     : '=',
                    optionsData : '=',
                    sdata : '='
                },
                template : '<div class="row">' +
                                '<div class="col-xs-12 wave-control-wrap">' +
        //                            '<div ng-show="ready">'+
					    '<button class="bw-btn" ng-click="bw()">' +
	                                    '</button>' +
	                                    '<button ng-class="{\'play-btn\': !playing, \'pause-btn\': playing}" ng-click="playpause()">' +
	                                    '</button>' +
	                                    '<button class="ff-btn" ng-click="ff()">' +
	                                    '</button>' +
	                                    '<span class="sound-duration pull-left" ng-show="ready">' +
	                                        '<span>{{moment | hms}}</span> / <span>{{length | hms}}</span>' +
	                                    '</span>' +
        //                            '</div>' +
					'<span></span>' + 

	//                                    '<span ng-class="{\'volume-100\' : volume_level > 50, \'volume-50\' : volume_level > 0 && volume_level <= 50, \'volume-0\' : volume_level === 0}" id="player_{{::uniqueId}}">' +
	//                                        '<span class="audio-volume" id="volume" style="width: 75%">' +
	//                                        '</span>' +
	//                                    '</span>' +

                                    '<div class="waveform" id="{{::uniqueId}}" style="width:99%;height:auto;margin-bottom:20px;">' +
                                    '</div>' +
   				    '<img ng-hide="ready" src="img/loading_bar.gif" width="99%" height="80px" />' +
				//  '<div ng-show="ready" style="height:auto;"><table><tr data-ng-repeat="(key,val) in sdata"><td style="width:30%;">{{ key }}</td><td style="width:70%;">{{val }}</td></tr></table></div>' +

                                '</div>' +
                            '</div>',
                link : function (scope, element, attributes) {
                    var id = uniqueId++;
                    scope.uniqueId = 'waveform_' + id;
		    scope.ready = false;
                    scope.wavesurfer = Object.create(WaveSurfer);
                    scope.playing    = false;

		    // IMPROVE SELECTOR W/ ID
                    var waveform = element.children()[0].children[0].children[5];

		    // scope.options = _.extend({container: waveform}, scope.options);

		    console.log('wave color 1',scope.urlData );
		    console.log('wave color 1',scope.optionsData);

                    scope.optionsData.container = waveform;
		    scope.optionsData.splitChannels = true;

                    scope.wavesurfer.init( scope.optionsData );
                    //scope.wavesurfer.init( waveoptions );
                    //scope.wavesurfer.load('/api/v2/call/recording/play');
                    scope.wavesurfer.load(scope.urlData);                                

                    scope.moment = "0";
                    // on ready
                    scope.wavesurfer.on('ready', function () {
			scope.ready = true;

                        scope.length = Math.floor(scope.wavesurfer.getDuration()).toString();
                        $interval(function () {
                            scope.moment = Math.floor(scope.wavesurfer.getCurrentTime()).toString();
                        }, parseFloat(scope.playrate) * 1000); 
                        
                        if(scope.optionsData && scope.optionsData.callback) {
			      scope.optionsData.callback();
			}
                    });
                    // what to be done on finish playing
                    scope.wavesurfer.on('finish', function () {
                        scope.playing = false;
                    });
                    // play/pause action
                    scope.playpause = function () {
                        scope.wavesurfer.playPause();
                        scope.playing = !scope.playing;
                    };
                    
                    scope.ff = function () {
                        scope.wavesurfer.skipForward();
                    };
                    
                    scope.bw = function () {
                        scope.wavesurfer.skipBackward();
                    };
                    
		    // cancel interval on scope destroy
                    scope.$on('$destroy', function(){
                      console.log("lets destroy here!");
		      scope.wavesurfer.destroy();
                    });
                }
            };
        });
}());
