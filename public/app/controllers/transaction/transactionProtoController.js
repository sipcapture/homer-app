    /*next*/    
    var injectTransactionProtoCtrlParams = ['$scope','searchService','$homerModal','$homerCflow','$timeout','$homerModalParams', '$sce', 'localStorageService','$filter'];
    
    var TransactionProtoCtrlController = function($scope, search, $homerModal, $homerCflow, $timeout, $homerModalParams, $sce, localStorageService, $filter) {

                var test;
                console.log("HJ");

                var data = $homerModalParams.params;
                $scope.data = data;

                $scope.dataLoading = true;
                $scope.showSipMessage = true;
                $scope.showSipDetails = false;

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

                $scope.id = $homerModalParams.id;
                $scope.transaction = [];
                $scope.clickArea = [];
                $scope.msgCallId = $homerModalParams.params.param.search.transaction_id[0];
                $scope.collapsed = [];
                $scope.enableTransaction = false;
                $scope.enableProtoInfo = false;
                $scope.enableLogReport = false;
                $scope.enableBlacklist = false;
                $scope.enableRemoteLogReport = false;

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
                                "heading": "Proto Info",
                                "active": true,
				"select": function(){resizeNull() },
				"ngshow": "enableTransaction",
				"icon": "glyphicon glyphicon-info-sign",
                                "template":"/templates/dialogs/tabs/registration_info.html"
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
                                "heading": "Remote Logs",
                                "active": true,
				"select": function(){ resizeNull() },
				"ngshow": "enableRemoteLogReport",
				"icon": "fa fa-file-text-o",
                                "template":"/templates/dialogs/tabs/logs_remote.html"
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

                var getCallFileName = function() {
                    var fileNameTemplete = defineExportTemplate();                                        
                    var callFileName = fileNameTemplete;
                    var ts_hms = new Date($scope.transaction.calldata[0].milli_ts);
                    var fileNameTime = (ts_hms.getMonth() + 1) + "/" + ts_hms.getDate() + "/" + ts_hms.getFullYear() + " " +
                        ts_hms.getHours() + ":" + ts_hms.getMinutes() + ":" + ts_hms.getSeconds();

                    callFileName = callFileName.replace("#{date}", fileNameTime);
                    callFileName = $.tmpl(callFileName, $scope.transaction.calldata[0]);
                    return callFileName;
                };

                $scope.exportCanvas = function() {
                    var myEl = angular.element(document.querySelectorAll("#" + $homerModalParams.id));
                    var canvas = $(myEl).find('#cflowcanv');
                    var a = document.createElement("a");
                    a.download = getCallFileName() + ".png";
                    a.href = canvas[0].toDataURL("image/png");
                    a.click();
                };

                $scope.exportPCAP = function() {
                    $scope.isPcapBusy = true;
                    makePcapText(this.data, 0, $scope.msgCallId);
                };

                $scope.exportTEXT = function() {
                    $scope.isTextBusy = true;
                    makePcapText(this.data, 1, $scope.msgCallId);
                };

                $scope.exportCloud = function() {
                    $scope.isCloudBusy = true;
                    makePcapText(this.data, 2, $scope.msgCallId);
                };

                $scope.exportShare = function() {
                    //makePcapText(this.data, false, $scope.msgCallId);		        
                    $scope.sharelink = "";
                    search.createShareLink(data).then(function(msg) {
                            if (msg) {
                                if (msg['url'] && msg['url'].match(/^http/)) {
                                        $scope.sharelink = msg['url'];
                                } else {
                                        $scope.sharelink = location.protocol+"//"+window.location.hostname+'/share/'+msg['url'];
                                }
                                
                                window.sweetAlert({
                                   title: "Ready to Share!",
                                   text: "Your session can be accessed <a target='_blank' href='" + $scope.sharelink + "'>here</a>",
                                   html: true
                                });
                                
                            } else {
                            	window.sweetAlert({
                                   title: "Oops!",
                                   type: "error",
                                   text: "Your session could not be shared!<br>If this persists, contact your Administrator",
                                   html: true
                                });
                            }
                        },
                        function(sdata) {
                            return;
                        }).finally(function() {

                    });
                };

                $scope.toggleTree = function(id) {
                    $scope.collapsed[id] = !$scope.collapsed[id];
                };

                
                $scope.getNumber = function(num) {
 			   return new Array(num);   
		};

		$scope.drawCanvas = function(id, mydata) {

                        var data = $homerCflow.setContext(id, mydata);
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

                
                $scope.showtable = true;
                $scope.activeMainTab = true;                    

                $scope.feelGrid = function(id, mydata) {

                    console.log("ADD DATA", mydata);    
                    $scope.headerType = "Event";                                        
                    $scope.rowCollection = mydata['messages'];
                    $scope.displayedCollection = [].concat($scope.rowCollection);                    
                    
                };

		$scope.transactionCheck = function(type) {
                	if(parseInt(type) == 86) return "XLOG";
	                else if(parseInt(type) == 34) return "RTP REPORT";
	                else if(parseInt(type) == 100) return "LOG";
	                else if(parseInt(type) == 102) return "REPORT";
	                else if(parseInt(type) == 87) return "MI";
	                else if(parseInt(type) == 88) return "REST";
			else if(parseInt(type) == 89) return "NET";
        	        else if(parseInt(type) == 4) return "WebRTC";
        	        else if(parseInt(type) == 1) return "SIP";
	                else return "REPORT";
		};

                $scope.protoCheck = function(proto) {
	                if(parseInt(proto) == 1) return "udp";
        	        else if(parseInt(proto) == 2) return "tcp";
                	else if(parseInt(proto) == 3) return "wss";
	                else if(parseInt(proto) == 4) return "sctp";
        	        else if(parseInt(proto) == 6) return "tcp"; 
                	else return "udp";
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
                                transaction_id: data.transaction_id
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

                    $homerModal.open({
                        url: 'templates/dialogs/message.html',
                        cls: 'homer-modal-message',
                        id: "message" + messagewindowId.hashCode(),
                        divLeft: posx.toString() + 'px',
                        divTop: posy.toString() + 'px',
                        params: search_data,
                        sdata: data,
                        internal: true,                                                                    
                        onOpen: function() {
                            console.log('modal1 message opened from url ' + this.id);
                        },
                        controller: 'messageCtrl'
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

                search.searchProtoByTransaction(data).then(function(msg) {
                        if (msg) {
                            //$scope.transaction = msg;
                            $scope.feelGrid($homerModalParams.id, msg);
                            $scope.drawCanvas($homerModalParams.id, msg);
                            
                            $scope.transaction = msg;                                                                
                            if ($scope.setSDPInfo) $scope.setSDPInfo(msg);
                        }
                    },
                    function(sdata) {
                        return;
                    }).finally(function() {
                    $scope.dataLoading = false;
                    //$scope.$apply();                           
                });

                $scope.showLogReport = function(rdata) {

                    search.searchLogReport(rdata).then(function(msg) {
			    if (!msg) return;
                            if (msg.length > 0) {
                                $scope.enableLogReport = true;
                                $scope.logreport = msg;
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

                $scope.showLogReport(data);
                //$scope.showRemoteLogReport(data);
                //$scope.showRtcReport(data);


                var makePcapText = function(fdata, type, transaction_id) {
                    search.makePcapTextforTransaction(fdata, type, "registration").then(function(msg) {

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
            
    };

    TransactionProtoCtrlController.$inject = injectTransactionProtoCtrlParams;
export default TransactionProtoCtrlController;
