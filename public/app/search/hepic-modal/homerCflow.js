(function() {
  'use strict';

  const myFlowStyle = {
    // CFLOW HOST CAPTION
    hosts: {
      drawdata: {
        TextColor: '#666666',
        Font: 'normal 11px Arial',
        LineColor: '#c2c2c2',
        LineWidth: 1,
      },
    },
    // CFLOW METHOD LABEL
    calldata: {
      drawdata: {
        Font: '11px Futura, Helvetica, Arial',
        ReColor: true,
      },
    },
  };

  let homerCflow = angular.module('homer.cflow', []);

  homerCflow.factory('$homerCflow', ['$rootScope', '$controller', '$location', '$timeout', '$compile', '$sniffer', '$q', '$filter', 'UserProfile', '$homerModal',
    function($rootScope, $controller, $location, $timeout, $compile, $sniffer, $q, $filter, UserProfile, $homerModal) {
      let cflows = {};
      let data, strToCol;
      let context;
      let messageData;
      let hostsContext;

      strToCol = function(data) {
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
          hash = data.charCodeAt(i) + ((hash << 5) - hash);
        }
        return 'hsl(' + ((hash >> 24) & 0xFF) + ', 75%, 35%)';
      };


      let self = {

        waitingForOpen: false,

        getCallIDColor: function(str) {
          let hash = 0;
          for (var i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
          }

          i = hash;
          let col = ((i >> 24) & 0xAF).toString(16) + ((i >> 16) & 0xAF).toString(16) +
            ((i >> 8) & 0xAF).toString(16) + (i & 0xAF).toString(16);
          if (col.length < 6) col = col.substring(0, 3) + '' + col.substring(0, 3);
          if (col.length > 6) col = col.substring(0, 6);
          // return '<span style="color:#'+col+';">' + str + '</span>';
          return '#' + col;
        },

        setContext: function(id, dataSIP) {
          let colorSets = {
            'colorSet1': ['#369EAD', '#C24642', '#96C412', '#C8B631', '#A2D1CF', '#D8C641', '#EE7757', '#6DBCEB', '#4A4946', '#52514E', '#4F81BC', '#A064A1', '#F79647'],
            'colorSet2': ['#4F81BC', '#C0504E', '#9BBB58', '#23BFAA', '#8064A1', '#4AACC5', '#F79647'],
          };

          this.sipMessages = dataSIP.calldata;
          this.rtpInfo = [];
          let hostData = new Object();
          this.dataLines = [];
          this.dataArrows = [];
          let dataSeriesCallid = {};
          this.dataCallid = [];
          let mykey;
          let colorLine;
          var sid;
          var alias;
          let sizeLen = 0;
          let dataRtp = {};
          let connected = 0;
          /* how many uniques hosts */
          this.hostSize = 0;
          let data = new Object();


          for (var sid in dataSIP.sid) {
            if (!dataSeriesCallid.hasOwnProperty(sid)) {
              // colorLine = colorSets["colorSet1"][this.dataSeriesCallid.length];
              // colorLine = colorSets["colorSet1"][sizeLen];
              colorLine = this.getCallIDColor(sid);
              sizeLen++;
              dataSeriesCallid[sid] = {
                name: sid,
                type: 'square',
                legendText: sid,
                markerColor: colorLine,
                markerSize: 2,
                divColor: {
                  'color': colorLine,
                },
                lineColor: colorLine,
              };
              this.dataCallid.push({
                name: sid,
                type: 'square',
                legendText: sid,
                markerColor: colorLine,
                markerSize: 2,
                lineColor: colorLine,
              });
            }
          }

          
          let pos = 0;

          let helem;
          let aliasMap = {};
	  let ip_alias = {};

	  try {
		if (dataSIP.alias) {
			let that = this;
			angular.forEach(dataSIP.alias, function(v, k) {
				ip_alias[k.split(':')[0]] = v.split(':')[0];
				ip_alias[k] = v;
			});
			} else {
				ip_alias = [];
			}
	  } catch(e) {
		console.log(e);
		ip_alias = [];
	  }

          for (var alias in dataSIP.hosts) {
            hostData[alias] = this.hostSize;
            helem = dataSIP.hosts[alias].hosts;
            aliasMap[alias] = alias;
            for (let realhost in helem) {
              let key = helem[realhost];
              aliasMap[key] = alias;
            }
            this.hostSize++;
          }

          console.log("ALIASFLOW", aliasMap);

          data['calldata'] = this.sipMessages;
          data['hosts'] = Object.keys(hostData).sort(function(a, b) {
            return hostData[a] - hostData[b];
          });

          let timezone = UserProfile.getProfile('timezone');
          let clickArea = [];
          let myEl = angular.element(document.querySelectorAll('#' + id));

          let minArrHeight = 50;

          if (!data['calldata']) return;

          let records = data['calldata'].length;
          records += 3;

          if (dataSIP.hasOwnProperty('rtppos')) {
            angular.forEach(dataSIP['rtppos'], function(hd, k) {
              records += 2;
            });
          }

          let hosts = {};
          let drawdata = {};
          let textlen = {
            width: 0,
          };

          // UPDATE PHASE - no call to enter(nodes) so all circles are selected
          let hostlen = Object.keys(dataSIP['hosts']).length - 1;

          let hostLen = Object.keys(dataSIP['hosts']).length;
          let dataUAC = dataSIP['uac'];

          let hostsData = [];
          var i = 0;
          


          angular.forEach(dataSIP['hosts'], function(hdata, key) {
            let value = parseInt(hdata['position']);

            drawdata = {};

            let iaz = {};
            iaz.name = key;
            iaz.id = i++;
            iaz.href = 'test';
            iaz.value = value;
            iaz.type = 'info_gateway';
            iaz.color = 'info__rectangle'; // can be info__rectangle_pink, blue
            // iaz.type = "info_caller";
            // iaz.type = "info_recipient";
		

	    if(ip_alias[key]) {
		iaz.name = ip_alias[key];
	    }

            hostsData[value] = iaz;

            drawdata.LineColor = '#000';
            drawdata.LineWidth = 1;
            drawdata.click = false;
            drawdata.position = value;

            /** ******************************************************************/

            hosts[key] = drawdata;
          });

          let hostsLen = ((data['calldata'].length - 1) ? (data['calldata'].length - 1) : 1);

          if (dataSIP.hasOwnProperty('rtppos')) {
            angular.forEach(dataSIP['rtppos'], function(hd, k) {
              hostsLen += 2;
            });
          }

          var i = 0,
            tmpX, tmpY, index = 0,
            y = 0;

          let messagesData = [];

          messageData = dataSIP['messages'];

          console.log('hosts', hosts);
          console.log('hostsData', hostsData);
          console.log('DA', dataSeriesCallid);
          let maxhost = Object.keys(hosts).length - 1;
          console.log(maxhost);

          angular.forEach(data['calldata'], function(value) {
            if (aliasMap.hasOwnProperty(value.srcId)) alias = aliasMap[value.srcId];
            else alias = value.srcId;

            tmpX = hosts[alias];

            if (aliasMap.hasOwnProperty(value.dstId)) alias = aliasMap[value.dstId];
            else alias = value.dstId;
            tmpY = hosts[alias];

            /** **************************/

            let iaz = {};
            iaz.pid = ++y;
            iaz.id = value.id;
            iaz.sid = index;
            iaz.proto = value.protocol;
            iaz.position = i;
            iaz.sid = value.hasOwnProperty('transaction_id') ? value.transaction_id : value.sid;
            iaz.date = $filter('date')(new Date(value.create_date), 'yyyy-MM-dd HH:mm:ss.sss Z', timezone.offset); ;
            iaz.method = value.method_text;
            iaz.method_ext = value.ruri_user;
            iaz.dbnode = value.node;
            iaz.micro_ts = value.create_date;
            iaz.x_pos = tmpX.position;
            iaz.y_pos = tmpY.position;
            iaz.color = dataSeriesCallid[iaz.sid].divColor;
            iaz.direction = tmpX.position >= tmpY.position ? 1 : 0;
            if (iaz.direction == 0) {
              iaz.midle_c = tmpY.position - tmpX.position;
              iaz.begin_c = tmpX.position;
              iaz.end_c = maxhost - tmpY.position;
              // if(tmpY.position == maxhost) iaz.midle_c++;
            } else {
              iaz.midle_c = tmpX.position - tmpY.position;
              iaz.begin_c = tmpY.position;
              iaz.end_c = maxhost - tmpX.position;
              // if(tmpX.position == maxhost) iaz.midle_c++;
            }

            if ((iaz.x_pos == 0 && iaz.y_pos == maxhost) || (iaz.x_pos == maxhost && iaz.y_pos == 0)) iaz.full = 1;
            else iaz.full = 0;


            /* NULL: message type and payload */
            if (value.message) {
              try {
                iaz.message = JSON.parse(value.message);
                if (iaz.message.text) iaz.message = iaz.message.text;
              } catch (err) {
                console.log('no message text');
              }
            }

            messagesData.push(iaz);
            /** **************************/

            sid = value.sid;

            /** *******   RTP *******/
            if (dataSIP.hasOwnProperty('rtppos') && dataSIP['rtppos'].hasOwnProperty(sid)) {
              angular.forEach(dataSIP['rtppos'][sid], function(hd, k) {
                if (hd == value.id) {
                  if (dataSIP.hasOwnProperty('sdp') && dataSIP['sdp'].hasOwnProperty(sid)) {
                    angular.forEach(dataSIP['sdp'][sid][k], function(osdp, rad) {
                      i++;

                      if (hosts.hasOwnProperty(osdp.sourceSipHost)) tmpX = hosts[osdp.sourceSipHost];
                      else tmpX = hosts[osdp.sourceSipHost];

                      if (hosts.hasOwnProperty(osdp.destinationSipHost)) tmpY = hosts[osdp.destinationSipHost];
                      else tmpY = hosts[osdp.destinationSipHost];

                      drawdata = {};
                      drawdata.LineColor = '#000';
                      drawdata.LineWidth = 3;
                      drawdata.mid = 1;
                      drawdata.sid = osdp.id;

                      drawdata = {};
                      drawdata.TextColor = 'blue';
                      drawdata.Text = 'Codec: ' + osdp.audioCodec + ': ' + rad + ': ' + osdp.sdpOrigin;
                      drawdata.FontSize = '16px';
                      drawdata.FontFamily = 'Currier';
                      drawdata.mid = 1;
                      drawdata.sid = osdp.id;
                      // drawdata.StartY =  i * heightCoof + 107;
                      // if(tmpX.StartX < tmpY.StartX) drawdata.StartX = tmpX.StartX + 20 ;
                      // else drawdata.StartX = tmpX.StartX  - textlen.width ;
                      drawdata.textAlign = 'start';
                      if (myFlowStyle) {
                        drawdata.Font = myFlowStyle.calldata.drawdata.Font;
                      }
                    });
                  }

                  return;
                }
              });
            }

            i++;
            index++;
          });

          let testdata = {};
          testdata.hosts = hostsData;
          testdata.messages = messagesData;
          testdata.sid = dataSeriesCallid;

          return testdata;
        },
      };

      return self;
    },
  ]);
})();
