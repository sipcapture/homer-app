/*
 * HOMER 5 UI (Xenophon)
 *
 * Copyright (C) 2011-2015 Alexandr Dubovikov <alexandr.dubovikov@gmail.com>
 * Copyright (C) 2011-2015 Lorenzo Mangani <lorenzo.mangani@gmail.com> QXIP B.V.
 * License AGPL-3.0 http://opensource.org/licenses/AGPL-3.0
 *
*/

(function (angular, hepic) {
    'use strict';
    
    angular.module('hepicApp').controller("hepicShareAppController", [ 
             "$scope", 
             '$rootScope', 
             '$location',      
             'search',
             '$timeout',
             '$homerModal',
	     '$homerCflow',
             function($scope, $rootScope, $location, search, $timeout, $homerModal, $homerCflow) {

		$rootScope.hepicApp = 'HEPIC';
		$rootScope.hepicVersion = '2.0';
		
		var tid = $location.path();
		if(tid.substring(0, 1) == '/') tid = tid.substring(1);
		
		console.log('Name ' + $rootScope.hepicApp + ', Version: '+$rootScope.hepicVersion);
		console.log('HEPIC TID:', tid);

		var test;
                console.log("HJ");

                var data = {
                    param: {
                        search: { share_id: tid}
                    }
                };                        
                $scope.data = data;

                $scope.dataLoading = true;
                $scope.showSipMessage = true;
                $scope.showSipDetails = false;
                $scope.shareLinkDisabled = true;

                $scope.clickSipDetails = function() {
                    console.log("details");
                };
                

                $scope.expandModal = function(id) {
                    console.log("expand", id);
		    var modal = document.getElementById(id);
		
		    if (!modal.style.extop) {
			    modal.style.extop = modal.style.top;
			    modal.style.exleft = modal.style.left;
			    modal.style.exheight = modal.style.height;
			    modal.style.exwidth = modal.style.width ? modal.style.width : '';
			    modal.style.top = '0px';
			    modal.style.left = '0px';
				modal.style.height = '100%';
				modal.style.width = '100%';
		    } else {
			    modal.style.top = modal.style.extop;
			    modal.style.left = modal.style.exleft ? modal.style.exleft : (window.innerWidth - modal.style.width) /2 + 'px';
			    modal.style.height = modal.style.exheight;
			    modal.style.width = modal.style.exwidth;
			    modal.style.extop = undefined;
		    }

		    modal.classList.toggle('full-screen-modal');
		    $scope.drawCanvas($scope.id, $scope.transaction);

                };

                $scope.id = "trans-1536000076";
                $scope.transaction = [];
                $scope.clickArea = [];
                $scope.msgCallId = tid;
                $scope.collapsed = [];
                $scope.enableTransaction = false;
                $scope.enableQualityReport = false;
                $scope.enableRTCPReport = false;
                $scope.enableLogReport = false;
                $scope.enableRecordingReport = false;
                $scope.enableDTMFReport = false;
                $scope.enableBlacklist = false;
                $scope.enableRemoteLogReport = false;
                $scope.enableRtcReport = false;
                $scope.enableXRTPReport = false;
                $scope.enableRTPAgentReport = false;
                $scope.enableQOSChart = false;

		$scope.tabExec = function(){ refreshChart();resizeNull(); };
		$scope.tabs = [
                        {
                                "heading": "Messages",
                                "active": true,
				"select": function(){ refreshGrid() },
				"ngshow": "tab",
				"icon": "zmdi zmdi-grid",
                                "template":"/templates/dialogs/tabs/sip_msg.html"
                        },
                        {
                                "heading": "Flow",
                                "active": true,
				"select": function(){resizeNull() },
				"ngshow": "tab",
				"icon": "fa fa-exchange",
                                "template":"/templates/dialogs/tabs/cflow.html"
                        },
                        {
                                "heading": "Call Info",
                                "active": true,
				"select": function(){refreshChart() },
				"ngshow": "enableTransaction",
				"icon": "glyphicon glyphicon-info-sign",
                                "template":"/templates/dialogs/tabs/call_info.html"
                        },
                        {
                                "heading": "Media Reports",
                                "active": true,
				"select": function(){refreshChart() },
				"ngshow": "enableQualityReport || enableXRTPReport || enableRTCPReport",
				"icon": "glyphicon glyphicon-signal",
                                "template":"/templates/dialogs/tabs/media_reports.html"
                        },
                        {
                                "heading": "DTMF",
                                "active": true,
				"ngshow": "enableDTMFReport",
				"select": function(){ resizeNull() },
				"icon": "fa fa-file-text-o",
                                "template":"/templates/dialogs/tabs/dtmf.html"
                        },
                        {
                                "heading": "Logs",
                                "active": true,
				"ngshow": "enableLogReport",
				"select": function(){ resizeNull() },
				"icon": "fa fa-file-text-o",
                                "template":"/templates/dialogs/tabs/logs.html"
                        },
                        {
                                "heading": "Recording",
                                "active": true,
				"ngshow": "enableRecordingReport",
				"select": function(){ resizeNull() },
				"icon": "fa fa-play-circle-o",
                                "template":"/templates/dialogs/tabs/recording.html"
                        },
                        {
                                "heading": "Remote Logs",
                                "active": true,
				"select": function(){ resizeNull() },
				"ngshow": "enableRemoteLogReport",
				"icon": "fa fa-file-text-o",
                                "template":"/templates/dialogs/tabs/logs_remote.html"
                        },
                        {
                                "heading": "WSS",
                                "active": true,
				"select": function(){ resizeNull() },
				"ngshow": "enableRtcReport",
				"icon": "fa fa-exchange",
                                "template":"/templates/dialogs/tabs/wss.html"
                        },
                        {
                                "heading": "Blacklist",
                                "active": true,
				"select": function(){ resizeNull() },
				"ngshow": "enableBlacklist",
				"icon": "fa fa-ban",
                                "template":"/templates/dialogs/tabs/blacklist.html"
                        },
                        {
                                "heading": "Export",
                                "active": true,
				"select": function(){ resizeNull() },
				"ngshow": "tab",
				"icon": "glyphicon glyphicon-download-alt",
                                "template":"/templates/dialogs/tabs/export.html"
                        },
                ];



		$scope.getCallIDColor = function(str) {
	
	            var hash = 0;
	            for (var i = 0; i < str.length; i++) {
	                hash = str.charCodeAt(i) + ((hash << 5) - hash);
	            }
	            i = hash;
	            var col = ((i >> 24) & 0xAF).toString(16) + ((i >> 16) & 0xAF).toString(16) +
	                ((i >> 8) & 0xAF).toString(16) + (i & 0xAF).toString(16);
	            if (col.length < 6) col = col.substring(0, 3) + '' + col.substring(0, 3);
	            if (col.length > 6) col = col.substring(0, 6);
	            //return '<span style="color:#'+col+';">' + str + '</span>';
	            return {
	                "color": "#" + col
	            };
	        }


                $scope.colorsChart = ['aqua', 'black', 'blue', 'fuchsia', 'gray', 'green', 'lime', 'maroon', 'navy', 'olive', 'orange', 'purple', 'red', 'silver', 'teal', 'white', 'yellow'];

		/* convertor */
		$scope.XRTP2value = function(prop){
			var res = prop; 
			switch(prop) {
			    case 'CD':
			        res = 'SEC';
			        break;
			    case 'JI':
			        res = 'JITTER';				
			        break;
			    case 'PR':
			        res = 'RCVD';				
			        break;
			    case 'PS':
			        res = 'SENT';				
			        break;
			    case 'PL':
			        res = 'LOST';				
			        break;
			    case 'PD':
			        res = 'DELAY';				
			        break;
			    case 'IP':
			        res = 'MEDIA IP:PORT';				
			        break;
			    default:
			        break;
			}
			return res; 
		};

                /* new param */
                $scope.beginRTCPDataDisplay = new Date();
                $scope.endRTCPDataDisplay = new Date();
                $scope.beginRTCPDataIsSet = false;
                $scope.TimeOffSetMs = (new Date($scope.beginRTCPDataDisplay)).getTimezoneOffset() * 60 * 1000;
                $scope.calc_report = {
                    list: [],
                    from: 0,
                    to: 0,
                    totalRtcpMessages: 0,
                    totalPacketLost: 0,
                    averagePacketLost: 0,
                    maxPacketLost: 0,
                    totalPackets: 0,
                    averageJitterMsec: 0,
                    maxJitterMsec: 0
                };

                $scope.jittersFilterAll = true;
                $scope.packetsLostFilterAll = true;
                /* jitter */

                var getCallFileName = function() {

                    console.log($scope.transaction);
                    
                    var fileNameTemplete = defineExportTemplate();
                    var callFileName = fileNameTemplete;
                    var ts_hms = new Date($scope.transaction.calldata[0].milli_ts);
                    var fileNameTime = (ts_hms.getMonth() + 1) + "/" + ts_hms.getDate() + "/" + ts_hms.getFullYear() + " " +
                        ts_hms.getHours() + ":" + ts_hms.getMinutes() + ":" + ts_hms.getSeconds();

                    callFileName = callFileName.replace("#{date}", fileNameTime);
                    console.log($scope.transaction.calldata[0]);
                    callFileName = callFileName.replace("#{destination_ip}", $scope.transaction.calldata[0]['destination_ip']);
                    callFileName = callFileName.replace("#{ruri_user}", $scope.transaction.calldata[0]['callid']);
                    //callFileName = $.tmpl(callFileName, $scope.transaction.calldata[0]);
                    return callFileName;
                };

                $scope.exportCanvas = function() {
                
                    console.log("CFLOWID", $scope.cflowid);
                    
                    var myEl = $("#"+$scope.cflowid);
		    var tempImage = document.getElementById('rendercanvas');

		    var renderingPromiseNew = html2canvas([tempImage], {
			  onclone: function(doc){
				return new Promise(function(resolve) {
				    var intImage = doc.getElementById('rendercanvas');
					intImage.append(doc.getElementById($scope.cflowid).parentElement.parentElement);
					intImage.style.width = '1024px';
					intImage.style.height = '1024px';
					resolve();
				});
			  },
			  allowTaint: true,
			  background: '#FFFFFF'
			}).then(function(canvas){
			    var img = canvas.toDataURL()
			    window.open(img);
			});
                };

                $scope.exportPCAP = function() {
                    $scope.isPcapBusy = true;
                    makePcapText(this.data, 0, $scope.msgCallId);
                };

                $scope.exportTEXT = function() {
                    console.log("Export TEXT");
                    $scope.isTextBusy = true;
                    makePcapText(this.data, 1, $scope.msgCallId);
                };

                $scope.exportCloud = function() {
                    $scope.isCloudBusy = true;
                    makePcapText(this.data, 2, $scope.msgCallId);
                };

                $scope.toggleTree = function(id) {
                    $scope.collapsed[id] = !$scope.collapsed[id];
                };
                
                $scope.getNumber = function(num) {
 			   return new Array(num);   
		};

		$scope.drawCanvas = function(id, mydata) {

                        var data = $homerCflow.setContext(id, mydata);
                        $scope.cflowid = "cflow-"+id;
                        console.log('canvas id:',id);
                        console.log('canvas data:',data);
			if (!data) return;
                        $scope.messages = mydata.messages;                        
                        $scope.callid = data.callid;                        

                        data.hostsA = data.hosts[data.hosts.length-1];
                        data.hosts.splice(-1, 1);
                        
                        $scope.hostsflow = data.hosts;
                        $scope.lasthosts = data.hostsA;
                        
                        $scope.messagesflow = data.messages;
                        $scope.maxhosts = data.hosts.length -1 ;
                        console.log($scope.maxhosts);
                        $scope.maxArrayHost = new Array($scope.maxhosts);

                        console.log($scope.maxArrayHost);
                        
                        
                };
                
		$scope.transactionCheck = function(type) {
                        if(parseInt(type) == 86) return "XLOG";
                        else if(parseInt(type) == 87) return "MI";
                        else if(parseInt(type) == 88) return "REST";
                        else if(parseInt(type) == 89) return "NET";   
                        else if(parseInt(type) == 4) return "WebRTC";
                        else return "SIP";
                };                

		$scope.protoCheck = function(proto) {
                        if(parseInt(proto) == 17) return "udp";
                        else if(parseInt(proto) == 8) return "tcp";
                        else if(parseInt(proto) == 3) return "wss"; 
                        else if(parseInt(proto) == 4) return "sctp";
                        else return "udp";
                };

                $scope.showtable = true;
                $scope.activeMainTab = true;                    

                $scope.feelGrid = function(id, mydata) {

		    var messages = mydata['messages'];
                    /*angular.forEach(mydata, function(v, k) {
			messages = messages.concat(v['messages']);
                    });
                    */
                    /* if message type = 1*/
                    $scope.headerType = "SIP Method";
                                                           
                    $scope.rowCollection = messages;
                    $scope.displayedCollection = [].concat($scope.rowCollection);                    
                    
                };
                
                $scope.showMessage = function(data, event) {

                    var search_data = {

                        timestamp: {
                            from: parseInt(data.micro_ts / 1000),
                            to: parseInt(data.micro_ts / 1000)
                        },
                        param: {
                            search: {
                                id: parseInt(data.id),
                                callid: data.callid
                            },
                            location: {
                                node: data.dbnode
                            },
                            transaction: {
                                call: false,
                                registration: false,
                                rest: false
                            }
                        }
                    };

                    console.log(data);

                    search_data['param']['transaction'][data.trans] = true;
                    var messagewindowId = "" + data.id + "_" + data.trans;
                    
                    var posx = event.clientX;
                    var posy = event.clientY;
                    var winx = window.screen.availWidth;
                    var winy = window.screen.availHeight;
                    var diff = parseInt((posx + (winx/3) + 20) - (winx));
		    // Reposition popup in visible area
                    if ( diff > 0 ) { posx -= diff; }     

                    console.log(messagewindowId.hashCode());

                    $homerModal.open({
                        url: '../templates/dialogs/message.html',
                        cls: 'homer-modal-message',
                        id: "message" + messagewindowId.hashCode(),
                        divLeft: posx.toString() + 'px',
                        divTop: posy.toString() + 'px',
                        params: data,
                        sdata: data,
                        internal: true,                                                                    
                        onOpen: function() {
                            console.log('modal1 message opened from url ' + this.id);
                        },
                        controller: 'messageCtrl'
                    });
                };
                            
                $scope.playStream = function(data, event) {

                    var search_data = {

                        timestamp: {
                            from: parseInt(data.micro_ts / 1000),
                            to: parseInt(data.micro_ts / 1000)
                        },
                        param: {
                            search: {
                                id: parseInt(data.id),
                                callid: data.callid
                            },
                            location: {
                                node: data.dbnode
                            },
                            transaction: {
                                call: false,
                                registration: false,
                                rest: false
                            }
                        }
                    };

                    console.log(data);

                    search_data['param']['transaction'][data.trans] = true;
                    var messagewindowId = "" + data.id + "_" + data.trans;
                    
                    var posx = event.clientX;
                    var posy = event.clientY;
                    var winx = window.screen.availWidth;
                    var winy = window.screen.availHeight;
                    var diff = parseInt((posx + (winx/3) + 20) - (winx));
		    // Reposition popup in visible area
                    if ( diff > 0 ) { posx -= diff; }     

                    console.log(messagewindowId.hashCode());

                    $homerModal.open({
                        url: 'templates/dialogs/playstream.html',
                        cls: 'homer-modal-message',
                        id: "playstream" + messagewindowId.hashCode(),
                        divLeft: posx.toString() + 'px',
                        divTop: posy.toString() + 'px',
                        params: search_data,
                        sdata: data,
                        internal: true,                                                                    
                        onOpen: function() {
                            console.log('modal1 message opened from url ' + this.id);
                        },
                        controller: 'playStreamCtrl'
                    });
                };
                
                $scope.showMessageById = function(id, event) {
                                    
                    var data = $scope.messages[--id];
                    $scope.showMessage(data, event);
                };
                
                $scope.clickMousePosition = function(event) {

                    var ret = false;
                    var obj = {};
                    var x = event.offsetX == null ? event.originalEvent.layerX - event.target.offsetLeft : event.offsetX;
                    var y = event.offsetY == null ? event.originalEvent.layerY - event.target.offsetTop : event.offsetY;

                    angular.forEach($scope.clickArea, function(ca) {
                        if (ca.x1 < x && ca.x2 > x && ca.y1 < y && ca.y2 > y) {
                            ret = true;
                            obj = ca;
                            return;
                        }
                    });

                    if (ret) {
                        if (obj.type == 'host') {
                            console.log('clicked on host');
                        } else if (obj.type == 'message') {
                            $scope.showMessage(obj.data, event);
                        }
                    }

                    return ret;
                };

                $scope.reApplyResize = function(ui) {
                    //$scope.drawCanvas2($scope.id, $scope.transaction);
                    //$scope.gridHeight = 250;
                };


                
                search.searchCallByTransaction(data).then(function(msg) {
                        if (msg) {
                            //$scope.transaction = msg;
                            $scope.feelGrid($scope.id, msg);
                            $scope.drawCanvas($scope.id, msg);
                            $scope.setSDPInfo(msg);
                            /* and now we should do search for LOG and QOS*/
                            console.log("RECEIVED", msg);
                            /*
                            angular.forEach(msg.callid, function(v, k) {
                                    console.log("K", k);
                                    if(data.param.search.callid.indexOf(k) == -1) {
                                        data.param.search.callid.push(k);
                                    }                                                                                			    
                            });
                            */
                                              
                            $scope.transaction = msg;                                                                  
                            console.log("SEARCH DATA", data);
                            $scope.showQOSReport(data);
                            $scope.showLogReport(data);
                            $scope.showRecordingReport(data);                                                        
                        }
                    },
                    function(sdata) {
                        return;
                    }).finally(function() {
                    $scope.dataLoading = false;
                    //$scope.$apply();                           
                });

                
		$scope.geomarkers = {};
                $scope.setSDPInfo = function(rdata) {


                            var msg;
                            console.log(rdata);
                            var chartDataExtended = {
	                	        list: [],
	                	        from: 0,
	                	        to: 0,
	                	        totalRtcpMessages: 0,
	                	        totalPacketLost: 0,
	                	        totalJitters: 0,
	                	        averageJitterMsec: 0,
	                	        averagePacketLost: 0,
	                	        maxPacketLost: 0,
	                	        totalPackets: 0,
	                	        maxJitterMsec: 0,
	                	        msg: [],
	                	        mos: [],
	                	        averageMos: 0,
	                	        worstMos: 5
                            };


                            
			    $scope.resizeNull = function(){
				setTimeout(function() {
				    window.dispatchEvent(new Event("resize"));
			        }, 200);
			    };

			    /* doctor */
                            if(rdata.messages)
                            {                            
				$scope.doctor = { one: 0, two: 0, three: 0, four: 0, five: 0, auth: 0, ring: 0 };
				rdata.messages.forEach(function(msg){
					if (msg.reply_reason >= 500) $scope.doctor.five++;
					else if (msg.reply_reason == 401 || msg.reply_reason == 407) $scope.doctor.auth++;
					else if (msg.reply_reason >= 400) $scope.doctor.four++;
					else if (msg.reply_reason >= 300) $scope.doctor.three++;
					else if (msg.reply_reason >= 200) $scope.doctor.two++;
					else if (msg.reply_reason >= 180) $scope.doctor.ring++;
					else if (msg.reply_reason >= 100) $scope.doctor.one++;
				});
				console.log('DOC:',$scope.doctor);

			    }

			    /* transaction & sdp analyzer */
                            if(rdata.transaction)
                            {                            
                            	$scope.enableTransaction = true;
				$scope.call_transaction = rdata.transaction;

				rdata.transaction.forEach(function(entry) {

					if (rdata.sdp[entry.callid] && rdata.sdp[entry.callid][0]) {
						entry.sdp = rdata.sdp[entry.callid][0];
					}

				    	if (entry.vqr_a) { 
						entry.vqr_a = JSON.parse(entry.vqr_a);
						switch (true) {
						  case (entry.vqr_a.mos < 1): entry.vqr_a.col="#db3236";break;
						  case (entry.vqr_a.mos < 2): entry.vqr_a.col="#db3236";break;
						  case (entry.vqr_a.mos < 3): entry.vqr_a.col="#F4C20D";break;
						  case (entry.vqr_a.mos < 4): entry.vqr_a.col="#E87A22";break;
						  case (entry.vqr_a.mos < 5): entry.vqr_a.col="#3cba54";break;
						}
						console.log(entry.vqr_a);
					}
				    	if (entry.vqr_b) {
						entry.vqr_b = JSON.parse(entry.vqr_b);
						switch (true) {
						  case (entry.vqr_b.mos < 1): entry.vqr_b.col="#db3236";break;
						  case (entry.vqr_b.mos < 2): entry.vqr_b.col="#db3236";break;
						  case (entry.vqr_b.mos < 3): entry.vqr_b.col="#F4C20D";break;
						  case (entry.vqr_b.mos < 4): entry.vqr_b.col="#E87A22";break;
						  case (entry.vqr_b.mos < 5): entry.vqr_b.col="#3cba54";break;
						}
						console.log(entry.vqr_b);
					}

					/* calculate call duration */
					if (entry.cdr_start && entry.cdr_stop) {
						if (entry.cdr_start > entry.cdr_stop) { entry.duration = '00:00:00'; }
						else { entry.duration = new Date( ( entry.cdr_stop - entry.cdr_start - 3600) * 1000).toString().split(" ")[4]; }
	
					} else {
						entry.duration = '00:00:00';
					}

					/* check blacklist */

					search.searchBlacklist(entry.source_ip).then(function(msg){
						console.log('Blacklist check '+entry.source_ip,msg);
						$scope.blacklistreport = msg;
						$scope.enableBlacklist = true;
					});


					/* prepare geostuff */
					console.log('MAP:',entry.geo_lat,entry.geo_lan,entry.dest_lat,entry.dest_lan);
					if (entry.geo_lat && entry.geo_lan) {
						$scope.geocenter = { lat: entry.geo_lat, lan: entry.geo_lan };
	    						    $scope.geomarkers[entry.source_ip.split('.').join('')] = {
	    						            lat: entry.geo_lat,
	    						            lng: entry.geo_lan,
	    						            message: "A-Party<br>"+entry.source_ip+":"+entry.source_port,
	    						            focus: true,
	    						            draggable: false
	    						    };

						if (entry.dest_lat && entry.dest_lan) {
	    						    $scope.geomarkers[entry.destination_ip.split('.').join('')] = {
	    						            lat: entry.dest_lat,
	    						            lng: entry.dest_lan,
	    						            message: "B-Party<br>"+entry.destination_ip+":"+entry.destination_port,
	    						            focus: false,
	    						            draggable: false
	    						    };
						}

						if (entry.destination_ip && (!entry.dest_lat || entry.dest_lat == 0) && search.searchGeoLoc) {
							search.searchGeoLoc(entry.destination_ip).then(function(results){
							    if (!results.lat && !results.lon) return;
							    // console.log('GEO-LOOKUP',results);
	    						    $scope.geomarkers[entry.destination_ip.split('.').join('')] = {
	    						            lat: results.lat,
	    						            lng: results.lon,
	    						            message: "B-Party IP<br>"+entry.destination_ip+":"+entry.destination_port,
	    						            focus: false,
	    						            draggable: false
	    						    };

							});
						}

					}

				});

				// Inject Maps
				if ($scope.geomarkers) {
						console.log('GEO-MARKERS',$scope.geomarkers);
						if($scope.geocenter) 
						{
        						angular.extend($scope,  {
	        						    leaflet: {
	        						      //  lat: entry.geo_lat,
	    	    					      //  lng: entry.geo_lan,
	    	    					        lat: $scope.geocenter.lat,
	    	    					        lng: $scope.geocenter.lan,
	    	    					        zoom: 4
	    	    					    },
	    	    					    markers: $scope.geomarkers,
	    	    					    defaults: {
	    						        scrollWheelZoom: false
	    	    					    }
	    	        				});
                                                 }
				}

			    }

                            if(rdata.sdp)
                            {                            
                                    try {
                                          if (rdata.sdp) {
						var leg = 1;
						$scope.call_sdp = rdata.sdp;
					  }
                                    } catch(e) { console.log('no call stats'); } 
                            }
                            

                            if (msg && msg.global) {

					try {
                                          if (msg.global.main) {
						// Call Duration
                                                var adur = new Date(null); adur.setSeconds(msg.global.main.duration/1000); // seconds
                                                $scope.call_duration = adur.toISOString().substr(11, 8);
						// Map averages
						chartDataExtended.averageMos = (msg.global.main.mos_average).toFixed(2);
						chartDataExtended.worstMos = (msg.global.main.mos_worst).toFixed(2);
						chartDataExtended.totalPacketLost = msg.global.main.packets_lost;
						chartDataExtended.maxPacketLost = msg.global.main.packets_lost;
						chartDataExtended.totalPackets = msg.global.main.packets_sent + msg.global.main.packets_recv;
						chartDataExtended.averagePacketLost = (msg.global.main.packets_lost * 100 / chartDataExtended.totalPackets).toFixed(1);
						chartDataExtended.averageJitterMsec = msg.global.main.jitter_avg.toFixed(2);
						chartDataExtended.maxJitterMsec = msg.global.main.jitter_max.toFixed(2);
                                          }
					} catch(e) { console.log('no rtcp stats'); } 


					try {
                                          if (msg.global.calls) {
						var leg = 1;
						$scope.calc_calls = msg.global.calls;
						if (!$scope.call_duration) {
                                                        var adur = new Date(null); adur.setSeconds($scope.calc_calls[Object.keys($scope.calc_calls)[0]].aparty.metric.duration/1000); // seconds
                                                        $scope.call_duration = adur.toISOString().substr(11, 8);  
                                                }
					  }
					} catch(e) { console.log('no call stats'); } 

                            }
                };

	
                $scope.showQOSReport = function(rdata) {

		    /* new charts test */

		    $scope.d3chart = {};
		    $scope.d3chart.data = {};
		    $scope.d3chart.stats = {};

                    search.searchQOSReport(rdata).then(function(msg) {

				/* HEPIC Types */
				 if(msg.reports.rtpagent && msg.reports.rtpagent.chart ) {
							    if (Object.keys(msg.reports.rtpagent.chart).length == 0) return;
				                            $scope.enableQualityReport = true;
                                                            // console.log('NEW: processing rtpagent charts');
                                                            //$scope.chartData.concat(msg.reports.rtcpxr.chart);

							    var fullrep = msg.reports.rtpagent.chart;
							    $scope.list_legend = [];
                                                            angular.forEach(fullrep, function(count, key) {
	                                                            angular.forEach(fullrep[key], function(count, callid) {
									// console.log('CALLID: ',callid);
		                                                            angular.forEach(fullrep[key][callid], function(count, leg) {
										// var xleg = leg.split('->')[0] ? leg.split('->')[0] : leg;
										var xleg = leg;
										/// console.log('LEG: ',leg,xleg);
										angular.forEach(fullrep[key][callid][leg], function(count, rep) {
										    // console.log('REP: ',rep);
											// console.log('LEG LOOKUP: '+callid);

										    	var d3newchart = { key: xleg, values: [], color: '#'+Math.floor(Math.random()*16777215).toString(16) };

											$scope.list_legend.push(rep);
											angular.forEach(fullrep[key][callid][leg][rep], function(count, data) {

											   // NEW chart
											   d3newchart.values.push({
												x: fullrep[key][callid][leg][rep][data][0], 
												y: fullrep[key][callid][leg][rep][data][1]
											   });
											   if(!$scope.d3chart.stats[rep]) $scope.d3chart.stats[rep] = { raw: [] } ;
											   $scope.d3chart.stats[rep].raw.push(fullrep[key][callid][leg][rep][data][1]);

											});


										    // NEW CHART
										    if(!$scope.d3chart.data[rep]) { 
											$scope.d3chart.data[rep] = { 
												series: [] 
											}; 
										    }

											var d3merged = false;
											$scope.d3chart.data[rep].series.forEach(function(entry){
												// console.log('SEEK '+xleg, entry.name);
												if (xleg == entry.name) {
													entry.data.concat(entry.data);
													d3merged = true;
												}
											});

										    if (!d3merged) $scope.d3chart.data[rep].series.push(d3newchart);

										    $scope.d3chart.stats[rep].min = Math.min.apply(null, $scope.d3chart.stats[rep].raw);
										    $scope.d3chart.stats[rep].max = Math.max.apply(null, $scope.d3chart.stats[rep].raw);


										});
		                                                            });
	                                                            });
                                                            });

							// console.log('FINAL-CHART:',$scope.d3chart);
                                                    }


				/* CLASSIC version below */

				var chartDataExtended = {
	                	        list: [],
	                	        from: 0,
	                	        to: 0,
	                	        totalRtcpMessages: 0,
	                	        totalPacketLost: 0,
	                	        totalJitters: 0,
	                	        averageJitterMsec: 0,
	                	        averagePacketLost: 0,
	                	        maxPacketLost: 0,
	                	        totalPackets: 0,
	                	        maxJitterMsec: 0,
	                	        msg: [],
	                	        mos: [],
	                	        averageMos: 0,
	                	        worstMos: 5
		            	};

				if (msg.global) {

					try {
                                          if (msg.global.main) {
						// Call Duration
                                                var adur = new Date(null); adur.setSeconds(msg.global.main.duration/1000); // seconds
                                                $scope.call_duration = adur.toISOString().substr(11, 8);
						// Map averages
						chartDataExtended.averageMos = (msg.global.main.mos_average).toFixed(2);
						chartDataExtended.worstMos = (msg.global.main.mos_worst).toFixed(2);
						chartDataExtended.totalPacketLost = msg.global.main.packets_lost;
						chartDataExtended.maxPacketLost = msg.global.main.packets_lost;
						chartDataExtended.totalPackets = msg.global.main.packets_sent + msg.global.main.packets_recv;
						chartDataExtended.averagePacketLost = (msg.global.main.packets_lost * 100 / chartDataExtended.totalPackets).toFixed(1);
						chartDataExtended.averageJitterMsec = msg.global.main.jitter_avg.toFixed(2);
						chartDataExtended.maxJitterMsec = msg.global.main.jitter_max.toFixed(2);
                                          }
					} catch(e) { console.log('no rtcp stats'); } 


					try {
                                          if (msg.global.calls) {
						var leg = 1;
						$scope.calc_calls = msg.global.calls;
						if (!$scope.call_duration) {
                                                        var adur = new Date(null); adur.setSeconds($scope.calc_calls[Object.keys($scope.calc_calls)[0]].aparty.metric.duration/1000); // seconds
                                                        $scope.call_duration = adur.toISOString().substr(11, 8);  
                                                }
					  }
					} catch(e) { console.log('no call stats'); } 

					try {
                                          if (msg.reports.xrtpstats && msg.reports.xrtpstats.main) {
						$scope.calc_xrtp = msg.reports.xrtpstats.main;
						$scope.calc_xrtp.mos_avg = $scope.calc_xrtp.mos_avg.toFixed(2);
						$scope.calc_xrtp.mos_worst = $scope.calc_xrtp.mos_worst.toFixed(2);
						$scope.calc_xrtp.packets_all = parseInt($scope.calc_xrtp.packets_sent) + parseInt($scope.calc_xrtp.packets_recv);
						$scope.calc_xrtp.lost_avg = ($scope.calc_xrtp.packets_lost * 100 / $scope.calc_xrtp.packets_all ).toFixed(2);
					  }
					} catch(e) { console.log('no x-rtp stats'); } 
					

					try {
                                          if (msg.reports.rtpagent && msg.reports.rtpagent.main) {
						$scope.calc_rtpagent = msg.reports.rtpagent.main;
						$scope.calc_rtpagent.mos_average = $scope.calc_rtpagent.mos_average.toFixed(2);
						$scope.calc_rtpagent.mos_worst = $scope.calc_rtpagent.mos_worst.toFixed(2);
						$scope.calc_rtpagent.lost_avg = ($scope.calc_rtpagent.packets_lost * 100 / $scope.calc_rtpagent.total_pk ).toFixed(2);
					  }
					} catch(e) { console.log('no rtpagent stats'); } 
					

					// RTCP
					try {
					  if(msg.reports.length != 0) { 					

					            var charts = {};
						    if(msg.reports.rtcp && msg.reports.rtcp.chart) {
						            //$scope.showQOSChart();
							    console.log('processing rtcp charts');
						            charts =  msg.reports.rtcp.chart;
						    }
						    	
						    // RTCP-XR
						    if(msg.reports.rtcpxr && msg.reports.rtcpxr.chart) {
							    console.log('processing rtcpxr charts');
						    	    //$scope.chartData.concat(msg.reports.rtcpxr.chart);	
						    	    var xrcharts =  msg.reports.rtcpxr.chart;
						    	    angular.forEach(xrcharts, function(count, key) {
						    	            if(!charts[key]) charts[key] = count;						    	            
						    	    });
						    }
                                                    
						    // RTPAGENT
						    if(msg.reports.rtpagent && msg.reports.rtpagent.chart) {
							    console.log('processing rtpagent charts');
						    	    //$scope.chartData.concat(msg.reports.rtcpxr.chart);	
						    	    var agcharts =  msg.reports.rtpagent.chart;
						    	    angular.forEach(agcharts, function(count, key) {		
						    	            if(!charts[key]) charts[key] = count;						    	            
						    	    });
						    }

                                                    $scope.chartData = charts;
						    $scope.streamsChart = {};			
						    var i = 0;			    
						    angular.forEach(charts, function(count, key) {
								$scope.streamsChart[key] = {};
								$scope.streamsChart[key]["enable"] = true;
								$scope.streamsChart[key]["name"] = key;
        							$scope.streamsChart[key]["short_name"] = key.substr(key.indexOf(' ')+1);								
        							$scope.streamsChart[key]["type"] =  key.substr(0, key.indexOf(' '));
								$scope.streamsChart[key]["sub"] = {};
								angular.forEach(count, function(v, k) {
								        $scope.streamsChart[key]["sub"][k] = {};
        								$scope.streamsChart[key]["sub"][k]["enable"] = false;								
        								$scope.streamsChart[key]["sub"][k]["parent"] = key;								
        								$scope.streamsChart[key]["sub"][k]["name"] = k;								
        								$scope.streamsChart[key]["sub"][k]["color"]= $scope.colorsChart[i++];
									if (k == 'mos') $scope.streamsChart[key]["sub"][k]["enable"] = true;
								});								                                                                
						    });
						    						    
						    var selData	= $scope.presetQOSChartData();
						    $scope.showQOSChart(selData);
					            
					  }
					} catch(e) { console.log('no chart data',e); } 

                                //showQOSChart
				console.log('Enable RTCP Report');
				$scope.calc_report = chartDataExtended;
                    		$scope.enableRTCPReport = true;

                                }


                        },
                        function(sdata) {
                            return;
                        }).finally(function() {
                        $scope.dataLoading = false;
                    });
                                                            
                    /*D3 */
                    
                    var apiD3 = {};
                    
                    $scope.options = {
                        chart: {
                            type: 'lineChart',
			    height: 250,
                            margin : {
                                top: 40,
                                right: 20,
                                bottom: 40,
                                left: 55
                            },
                         //   x: function(d){ return d.timefield; },
                         //   y: function(d){ return d.value; },
                            useInteractiveGuideline: true,
                            xAxis: {
                         //      axisLabel: 'Time',
                                tickFormat: function(d) {
                                    return d3.time.format('%H:%M')(new Date(d*1000));
                                },
                            },
                            yAxis: {
                        //        axisLabel: 'Packets',
                                tickFormat: function(d){
                                    return d3.format('.02f')(d);
                                },
                                axisLabelDistance: -10
                            },
                            showLegend: true
                        }
		    };

		    function lineChartData() {
			var sin = [],sin2 = [], cos = [];

			//Data is represented as an array of {timefield,value} pairs.
			for (var i = 0; i < 100; i++) {
				sin.push({timefield: i, value: Math.sin(i/10)});
			        sin2.push({timefield: i, value: i % 10 == 5 ? null : Math.sin(i/10) *0.25 + 0.5});
			        cos.push({timefield: i, value: .5 * Math.cos(i/10+ 2) + Math.random() / 10});
			}

			//Line chart data should be sent as an array of series objects.
			return [
			        {
			            values: sin,      //values - represents the array of {x,y} data points
			            key: 'Sine Wave', //key  - the name of the series.
			            color: '#ff7f0e'  //color - optional: choose your own line color.
			        },
		        	{
			            values: cos,
			            key: 'Cosine Wave',
			            color: '#2ca02c'
			        },
			        {
			            values: sin2,
			            key: 'Another sine wave',
			            color: '#7777ff',
			            area: true      //area - set to true if you want this line to turn into a filled area chart.
			        }
			];
		   };                    
		   // $scope.data = lineChartData;
        		   
		   /* API OF D3 */
	           $scope.callbackD3 = function(scope, element) {
			apiD3[scope.$id] = scope.api;
			//apiD3.updateWithTimeout(200);
	           };
		           
		   angular.element(window).on('resize', function(e){
		            //apiD3.updateWithTimeout(200);
		            angular.forEach(apiD3, function(v, k) {		            		                
		                v.updateWithTimeout(500);
		                //v.update();
                            });
		            //if (apiD3) apiD3.update();
                            //$scope.refreshChart();
                            // $scope.resizeNull();
	           });
		   
		   
                };
                
                $scope.addRemoveStreamSerie = function(stream, subeb) {
                
                    if(subeb == 1) 
                    {
                            angular.forEach(stream["sub"], function(v, k) {
                                 console.log("ZZ");       
                            });
                    }                    
                    
                    var selData = $scope.presetQOSChartData();
                    $scope.showQOSChart(selData);                    
                };
                

		$scope.presetQOSChartData = function() {
			
			var seriesData = [];     
			var chartData = $scope.chartData;              
			$scope.selectedColorsChart = [];
                        angular.forEach(chartData, function(count, key) {
								
				if($scope.streamsChart && $scope.streamsChart[key] && $scope.streamsChart[key]["enable"] == false) 
							return;
	
				var localData = chartData[key];
				angular.forEach(localData, function(das, kes) {
				
				        /* skip it */
				        
				        if($scope.streamsChart[key]["sub"][kes]["enable"] == false) return;				
				        
				        var sar = {};
        	        		sar["name"] = kes;
			                sar["type"] = "line";
			                sar["color"] = $scope.streamsChart[key]["sub"][kes]["color"];

			                var lDas = [];
			                angular.forEach(das, function(v, k) { lDas.push([v[0],v[1]]);});

                                        lDas.sort(function(a, b) {
			        	    return a[0] - b[0];
			                });
			                sar["data"] = lDas;
                			seriesData.push(sar);
				});
		        });
		        return seriesData;
		};


                $scope.showQOSChart = function(seriesData) {

    	                $scope.enableQOSChart = true;

			$scope.chartConfig = {
		                    chart: {
		                        type: 'line'
                		    },
		                    title: {
                		        text: "TEST",
		                        style: {
                		            display: "none"
		                        }
		                    },
		                    xAxis: {
		                        title: {
                		            text: null
		                        },
                		        type: "datetime"
		                    },
		                    yAxis: {
                		        title: {
		                            text: null
                		        },
		                        min: 0
                		    },
		                    plotOptions: {
                		        column: {}
		                    },
		                    tooltip: {},
                		    legend: {
		                        enabled: false,
                		        borderWidth: 0
		                    },
		                    series: seriesData,
				    func: function(chart) {
                                            $scope.$evalAsync(function () {
                                                    chart.reflow();
                                            });
                                    }
			};

	                $scope.chartConfig.chart["zoomType"] = "x";
        	        $scope.chartConfig.tooltip["crosshairs"] = true;
	                $scope.chartConfig.tooltip["shared"] = true;
                };
                
		$scope.refreshChart = function() {
                        $timeout(function() {
                                $scope.$broadcast('highchartsng.reflow');
                        }, 30);
                };
                
                $scope.refreshGrid = function() {
                    console.log("refresh grid");
                };


                $scope.showLogReport = function(rdata) {

                    search.searchLogReport(rdata).then(function(msg) {

                            if (msg.length > 0) {
                                $scope.enableLogReport = true;
				msg.forEach(function(entry) {
				    if (entry.data) {
					try { entry.data = JSON.parse(entry.data) } catch(err) {};
					/* DTMF Parser */
					if (entry.data.DTMF) {
						entry.dtmf = {};
		                                $scope.enableDTMFReport = true;
						try { 
							entry.data.DTMF.split(';').forEach(function(item,i){
									if (!item || item == "") return;
									entry.dtmf[i] = {};
									item.split(',').forEach(function(pair){
											var kv = pair.split(':');
											if (!kv[0] || !kv[1]) return;
											entry.dtmf[i][kv[0]] = kv[1];
									});
							});
						} catch(err) { $scope.enableDTMFReport = false; };						
					}
				    }
				    console.log('PARSED LOG!',entry);
				});
                                $scope.logreport = msg;
                            }
                        },
                        function(sdata) {
                            return;
                        }).finally(function() {
                        $scope.dataLoading = false;
                    });
                };
                
                $scope.showRecordingReport = function(rdata) {


                    console.log("SEARCH Recording report");
                    search.searchRecordingReport(rdata).then(function(msg) {

                            console.log("SEARCH Recording result", msg);                            
                            
                            if (msg.length > 0) {
                                $scope.enableRecordingReport = true;
                                
                                $scope.rowRecordingCollection = msg;
                                $scope.displayedRecordingCollection = [].concat($scope.rowRecordingCollection);
                                                    
                                /*                                                    
				msg.forEach(function(entry) {
				    if (entry.data) {
					try { entry.data = JSON.parse(entry.data) } catch(err) {};
				    }
				    console.log('PARSED LOG!',entry);
				});
				*/
                            }
                        },
                        function(sdata) {
                            return;
                        }).finally(function() {
                        $scope.dataLoading = false;
                    });
                };
                
                $scope.showRemoteLogReport = function(rdata) {

                    search.searchRemoteLog(rdata).then(function(msg) {

                            $scope.enableRemoteLogReport = true;
                            if(msg && msg.hits && msg.hits.hits) $scope.remotelogreport = msg.hits.hits;                            
                        },
                        function(sdata) {
                            return;
                        }).finally(function() {
                        $scope.dataLoading = false;
                    });
                };

                $scope.showRtcReport = function(rdata) {

                    search.searchRtcReport(rdata).then(function(msg) {

                            if (msg && msg.length > 0) {
                                $scope.enableRtcReport = true;
                                $scope.rtcreport = msg;
                            }
                        },
                        function(sdata) {
                            return;
                        }).finally(function() {
                        $scope.dataLoading = false;
                    });
                };

                $scope.setRtcpMembers = function() {
                    $scope.rtcpMembers = [];
                    var tmp = {};
                    $scope.rtcpreport.forEach(function(rtcpData) {
                        var currentName = rtcpData.source_ip + " -> " + rtcpData.destination_ip;
                        if (tmp[currentName] == undefined) {
                            $scope.rtcpMembers.push({
                                name: currentName,
                                isShowJitter: true,
                                isShowPacketLost: true,
                                isShowStream: true
                            });
                            tmp[currentName] = currentName;
                        }
                    });
                    console.log("$scope.rtcpMembers: ", $scope.rtcpMembers);
                }


                // console.log(data);

                /* SHOW IT LATER AFTER MESSAGE RESULT*/
                //$scope.showQOSReport(data);
                //$scope.showLogReport(data);
                //$scope.showRecordingReport(data);
                //$scope.showRemoteLogReport(data);
                //$scope.showRtcReport(data);


                var makePcapText = function(fdata, type, callid) {
                
                    search.makePcapTextforTransaction(fdata, type).then(function(msg) {

                            $scope.isPcapBusy = false;
                            $scope.isTextBusy = false;
                            $scope.isCloudBusy = false;

                            var filename = getCallFileName() + ".pcap";
                            var content_type = "application/pcap";

                            if (type == 1) {
                                filename = getCallFileName() + ".txt";
                                content_type = "attacment/text;charset=utf-8";
                            } else if (type == 2) {
                                if (msg.data && msg.data.hasOwnProperty("url")) {
                                    window.sweetAlert({
                                        title: "Export Done!",
                                        text: "Your PCAP can be accessed <a target='_blank' href='" + msg.data.url + "'>here</a>",
                                        html: true
                                    });
                                } else {
                                    var error = "Please check your settings";
                                    if (msg.data && msg.data.hasOwnProperty("exceptions")) error = msg.data.exceptions;
                                    window.sweetAlert({
                                        title: "Error",
                                        type: "error",
                                        text: "Your PCAP couldn't be uploaded!<BR>" + error,
                                        html: true
                                    });
                                }
                                return;
                            }

                            var blob = new Blob([msg], {
                                type: content_type
                            });
                            saveAs(blob, filename);

                        },
                        function(sdata) {
                            return;
                        }).finally(function() {});
                };

                $timeout(function() {
                    if ($homerModal.getOpenedModals().indexOf('tempModal') !== -1) {
                        $homerModal.close('tempModal', 'var a', 'var b');
                    }
                }, 5000);



                $scope.treedata2 = [{
                    "id": 1,
                    "title": "node1",
                    "nodes": [{
                        "id": 11,
                        "title": "node1.1",
                        "nodes": [{
                            "id": 111,
                            "title": "node1.1.1",
                            "nodes": []
                        }]
                    }, {
                        "id": 12,
                        "title": "node1.2",
                        "nodes": []
                    }]
                }, {
                    "id": 2,
                    "title": "node2",
                    "nodes": [{
                        "id": 21,
                        "title": "node2.1",
                        "nodes": []
                    }, {
                        "id": 22,
                        "title": "node2.2",
                        "nodes": []
                    }]
                }, {
                    "id": 3,
                    "title": "node3",
                    "nodes": [{
                        "id": 31,
                        "title": "node3.1",
                        "nodes": []
                    }]
                }];                                            
             }                          
    ])
    .controller('messageCtrl', [
                '$scope', 
                '$homerModal', 
                '$homerModalParams',                                
                '$timeout', 
		'$sce',
                function($scope, $homerModal, $homerModalParams, $timeout, $sce) {

		var sdata = $homerModalParams.params;
		console.log(sdata);


		$scope.dataLoading = false;
		$scope.showSipMessage = true;
		$scope.showSipDetails = false;
		
		$scope.clickSipDetails = function() {
		    console.log("details");
		};
		
		var swapText = function(text){
		    var swpA, swpB;
 		    text = text.split('<').join('&lt;');
 			  	
 		    swpA = sdata.method; 
 		    swpB = '<font color=\'red\'><b>'+swpA+'</b></font>';
		    text = text.split(swpA).join(swpB);

		    swpA = sdata.callid; 
		    swpB = '<font color=\'blue\'><b>'+swpA+'</b></font>';
		    text = text.split(swpA).join(swpB);

		    swpA = sdata.from_tag; 
		    swpB = '<font color=\'red\'><b>'+swpA+'</b></font>';
		    text = text.split(swpA).join(swpB);

		    swpA = sdata.via_1_branch; 
		    swpB = '<font color=\'green\'><b>'+swpA+'</b></font>';
		    text = text.split(swpA).join(swpB);
			  				  	
		    return $sce.trustAsHtml(text);
		};
		
		$scope.msgId = sdata.id;
		$scope.msgCallId = sdata.callid;
                $scope.msgDate = sdata.micro_ts/1000;
		$scope.sipPath = sdata.source_ip+":"+sdata.source_port+ " -> "+sdata.destination_ip+":"+sdata.destination_port;
		$scope.sipMessage = swapText(sdata.message);    //.replace(/</g, "&lt;");
			  			  
		var tabjson=[];
                for (var p in sdata) {
                    if(p == "message") continue;
                    if(p.startsWith("$")) continue;
                    if (sdata.hasOwnProperty(p) && sdata[p] != '' && typeof sdata[p] == 'string') {
                      tabjson.push(''+p +''+ ': <b>' + sdata[p].split('<').join('&lt;')+'</b><br>');
                    }
                    tabjson.push();
                    $scope.sipDetails = "<div id='"+sdata.id+"_details'>"+tabjson.join('')+"</div>";
			  $scope.trustedHtmlDetails = $sce.trustAsHtml($scope.sipDetails);			  
                }
                
                $timeout(function() {
                        if($homerModal.getOpenedModals().indexOf('tempModal') !== -1) {
                        $homerModal.close('tempModal', 'var a', 'var b');
                        }
                }, 5000);                
	 }
       ]) 
       .directive('draggable', function(){
            return {
              restrict: 'EA',
              link: function(scope, element) {

                        $(element)
                        .draggable({
                              cancel: ".homer-modal-body, .close",
                              handle: ".homer-modal-header",
                              start: function( event, ui ) {
                                ui.helper[0].style.opacity=0.7;
                                var i = 0;
                                var elements=document.getElementsByClassName('opened');
                                for(i=0;i<elements.length;i++){if(!elements[i].style.zIndex){elements[i].style.zIndex=10001;}}
                                if (window.topZ){window.topZ++;ui.helper[0].style.zIndex = window.topZ; }
                                else{ui.helper[0].style.zIndex++;window.topZ = ui.helper[0].style.zIndex;}
                              },
                              stop: function( event, ui ) {
                                if (ui.helper[0]) {
                                        ui.helper[0].style.opacity=1;
                                        if (ui.offset.top < 0) ui.helper[0].style.top = '0px';
                                        if (ui.offset.left < 0) ui.helper[0].style.left = '0px';
                                        if ((ui.offset.left + 100 ) > window.innerWidth) {
                                                ui.helper[0].style.left = (window.innerWidth - 100)+'px';
                                                window.scrollTo(0, 0);
                                        }
                                        if ((ui.offset.top + 50 ) > window.innerHeight) {
                                                ui.helper[0].style.top = (window.innerHeight - 50)+'px';
                                                window.scrollTo(0, 0);
                                        }

                                }
                              }
                        })
                        .resizable({
                            resize: function (evt, ui) {
                                var canv = $(element).find('#cflowcanv');
                                if($(canv).length > 0)
                                {
                                    scope.reDrawCanvas();
                                }

                                var messagebody = $(element).find('.homer-modal-body');
                                $(messagebody).width(ui.size.width - 10);
                                $(messagebody).height(ui.size.height - 50);
                            }
                        });
                }
             }
         });
}(angular, hepic));
