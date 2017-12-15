    var injectParams = ['$rootScope', 'eventbus','$websocket','EVENTS'];

    var messagesFactory = function ($rootScope, eventbus, $websocket, EVENTS) {

        var ws;
        //var collection = [];
        var webSocketInit = false;
        
        var isInit = function() {
          return webSocketInit;
        };
        
        var closeWebsocket = function() {
              if(ws && ws.close)   ws.close();
              webSocketInit = false;
        };

        var wsOptions = {            
            reconnectIfNotNormalClose: true
        };

        
        var initSocket =  function() {
        
                var host = window.location.hostname;
                var port = window.location.port;
                
                console.log("CONSOLE:", host + ":" + port);
                if(!WEBSOCKET) {
                    console.log("WEBSOCKET DISABLED");
                    return;
                }
                
                ws = $websocket('ws://'+host+':'+port+'/api/v2/websocket', null, wsOptions);        
                webSocketInit = true;
                                
                ws.onMessage(function(event) {
                        console.log('message: ', event);
                        var res;
                        try {
                              res = JSON.parse(event.data);                              
                        } catch(e) {
                              res = {'event': 'unknown', 'sender': 'anonymous', 'message': event.data};
                        }
                        
                        if(res && res.event && res.event == "command" && res.command) 
                        {
                            console.log("THIS IS COMMAND!", res);                        
                            eventbus.broadcast(EVENTS.WEBSOCKET_COMMAND, res);
                        }   
                        else {
                            eventbus.broadcast(EVENTS.SHOW_NEW_MESSAGE, res);                                                                
                            console.log("MAF", res);
                        }             

                        /*collection.push({
                          username: res.username,
                          content: res.message,
                          timeStamp: event.timeStamp
                        });
                        */
                 });

                 ws.onError(function(event) {
                     webSocketInit = false;
                     console.log('connection Error', event);
                 });

                 ws.onClose(function(event) {
                     webSocketInit = false;
                     console.log('connection closed', event);
                     var res = {
                             'sender': 'system', 
                             'timestamp': new Date().getTime(),
                             'event': 'system',                                                 
                             'message': "The connection to the server has been lost! Reconnect in a while"
                     };
                             
                     eventbus.broadcast(EVENTS.SHOW_NEW_MESSAGE, res);

                 });
                 
                 ws.onOpen(function() {
                    webSocketInit = true;
                    console.log('connection open');
                    systemMessage("system","connection open");        
                    eventbus.broadcast(EVENTS.WEBSOCKET_OPEN, 1);   
                });
        };
        
        var systemMessage = function(user, type, message) {
             var srmsg = {
                    'timestamp': new Date().getTime(),                    
                    'event': 'system', 
                    'type': type,
                    'sender': user,
                    'recipient': 'system',
                    'message': message
            };
            ws.send(JSON.stringify(srmsg));        
        };
        
        var userMessage = function(user, recipient, type, message) {
             var srmsg = {
                    'timestamp': new Date().getTime(),                    
                    'event': 'message', 
                    'type': type,
                    'sender': user,
                    'recipient': recipient,
                    'message': message
            };
            
            ws.send(JSON.stringify(srmsg));        
        };
        

    
        // setTimeout(function() {
          //   ws.close();
          // }, 500)                        
                     
        return {
            //collection: collection,
            status: function() {
                return ws.readyState;
            },
            initSocket: initSocket,    
            isInit: isInit,
            closeWebsocket: closeWebsocket,
            sendSystemMessage: systemMessage,
            sendUserMessage: userMessage,            
            
            sendRaw: function(message) {
                if (angular.isString(message)) {
                    ws.send(message);
                }
                else if (angular.isObject(message)) {
                        ws.send(JSON.stringify(message));
                }
            }
        };
    };

    messagesFactory.$inject = injectParams;
export default messagesFactory;
