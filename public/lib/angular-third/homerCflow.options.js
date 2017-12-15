var myFlowStyle =
        {
                // CFLOW HOST CAPTION
                "hosts" :
                         { "drawdata":
                                       {
                                                "TextColor": "#666666",
                                                "Font": "normal 11px Arial",
                                                "LineColor": "#c2c2c2",
                                                "LineWidth": 1
                                        }
                        },
                // CFLOW METHOD LABEL
                "calldata" :
                          { "drawdata":
                                       {
                                                "Font": "11px Futura, Helvetica, Arial",
                                                "ReColor": true
                                        }
               }
        };

var myUserAgents = [
                 {"rule": "asterisk|Asterisk", "img": "/img/gateways/asterisk.jpg" },
                 {"rule": "freeswitch|FreeSWITCH|mod_sofia", "img": "/img/gateways/freeswitch.jpg" },
                 {"rule": "kamailio|Kamailio|NGCP|Sipwise", "img": "/img/gateways/kamailio.jpg" },
                 {"rule": "opensips|OpenSIPS", "img": "/img/gateways/kamailio.jpg" },
                 {"rule": "^hep|^HEP", "img": "/img/gateways/captagent.jpg" },
                 {"rule": "Grandstream|snom|Yealink|Cisco|Linksys|Aastra", "img": "/img/gateways/useragent.jpg" },
                 {"rule": "eyeBeam|X-Lite|baresip", "img": "/img/gateways/useragent.jpg" },
                 {"rule": "friendly|Vax|vicious|sipcli", "img": "/img/gateways/scanner.jpg" }
];
