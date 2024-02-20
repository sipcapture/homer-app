package model

import (
	"container/list"
	"encoding/json"
	"os"
	"time"
)

// swagger:model SearchObject
type SearchObject struct {
	// required: true
	Param struct {
		Transaction struct {
		} `json:"transaction"`
		// this controls the number of records to display
		// example: 200
		// required: true
		Limit int `json:"limit"`
		// this control the type of search one can perform
		// type: string
		// format: binary
		// example: `{"1_call":[{"name":"limit","value":"10","type":"string","hepid":1}]}`
		Search json.RawMessage `json:"search"`
		// this control the type of search one can perform
		// type: boolean
		// example: false
		OrLogic bool `json:"orlogic"`
		// ips to be removed from search
		// required: false
		// type: array
		// items:
		//  type: string
		// 	example: ["192.168.10.20"]
		WhiteList []string `json:"whitelist"`
		// location
		// required: false
		// type: object
		Location struct {
			Node []string `json:"node"`
		} `json:"location"`
		// timezone settings
		// type: object
		// default: null
		Timezone struct {
			Value int    `json:"value"`
			Name  string `json:"name"`
		} `json:"timezone"`
	} `json:"param"`
	// this control the time range for used for search
	Timestamp struct {
		// current timestamp in milliseconds
		// required :true
		// example: 1581793200000
		From int64 `json:"from"`
		// current timestamp in milliseconds
		// required :true
		// example: 1581879599000
		To int64 `json:"to"`
	} `json:"timestamp"`
}

type HepTable struct {
	Id             int64           `json:"id"`
	Sid            string          `json:"sid"`
	CreatedDate    time.Time       `gorm:"column:create_date" json:"create_date"`
	ProtocolHeader json.RawMessage `gorm:"column:protocol_header" json:"protocol_header"`
	DataHeader     json.RawMessage `gorm:"column:data_header" json:"data_header"`
	Raw            string          `gorm:"column:raw" json:"raw"`
	DBNode         string          `gorm:"column:-" json:"dbnode"`
	Node           string          `gorm:"column:-" json:"node"`
	Profile        string          `gorm:"column:-" json:"profile"`
}

type TransactionTable struct {
	ViaBranch string               `json:"via_branch"`
	Name      string               `json:"name"`
	ErrorName string               `json:"error_name"`
	BeginDate time.Time            `json:"begin_date"`
	FromUser  string               `json:"from_user"`
	ToUser    string               `json:"to_user"`
	TMethods  []*TransactionMethod `json:"t_methods"`
}

type TransactionMethod struct {
	Name      string     `json:"name"`
	CSeq      string     `json:"cseq"`
	BeginDate time.Time  `json:"begin_date"`
	BodyList  *list.List `json:"body_list"`
}

type Message struct {
	Id     int            `json:"id"`
	Sid    string         `json:"sid"`
	ProtoH ProtocolHeader `json:"protocol_header"`
	DataH  DataHeader     `json:"data_header"`
	Raw    string         `json:"raw"`
}

type ProtocolHeader struct {
	DstIP          string `json:"dstIp"`
	SrcIP          string `json:"srcIp"`
	DstPort        int    `json:"dstPort"`
	SrcPort        int    `json:"srcPort"`
	Protocol       int    `json:"protocol"`
	CaptureID      string `json:"captureId"`
	CapturePass    string `json:"capturePass"`
	PayloadType    int    `json:"payloadType"`
	TimeSeconds    int    `json:"timeSeconds"`
	TimeUseconds   int    `json:"timeUseconds"`
	correlationId  string `json:"correlation_id"`
	ProtocolFamily int    `json:"protocolFamily"`
}

type DataHeader struct {
	CallID     string `json:"callid"`
	CSeq       string `json:"cseq"`
	Method     string `json:"method"`
	ToTag      string `json:"to_tag"`
	ToUser     string `json:"to_user"`
	FromTag    string `json:"from_tag"`
	PidUser    string `json:"pid_user"`
	AuthUser   string `json:"auth_user"`
	FromUser   string `json:"from_user"`
	RuriUser   string `json:"ruri_user"`
	UserAgent  string `json:"user_agent"`
	RuriDomain string `json:"ruri_domain"`
	ViaBranch  string `json:"via_branch"`
}

/*
type TransactionObject struct {
	Timestamp struct {
		From int64 `json:"from"`
		To   int64 `json:"to"`
	} `json:"timestamp"`
	Param struct {
		Search struct {
			OneCall struct {``
				ID     int           `json:"id"`
				Callid []string      `json:"callid"`
				UUID   []interface{} `json:"uuid"`
			} `json:"1_call"`
		} `json:"search"`
		Location struct {
		} `json:"location"`
		Transaction struct {
			Call         bool `json:"call"`
			Registration bool `json:"registration"`
			Rest         bool `json:"rest"`
		} `json:"transaction"`
		ID struct {
		} `json:"id"`
		Timezone struct {
			Value int    `json:"value"`
			Name  string `json:"name"`
		} `json:"timezone"`
	} `json:"param"`
}
*/

type TransactionResponse struct {
	Total int        `json:"total"`
	D     SecondData `json:"data"`
}

type SecondData struct {
	Messages []Message `json:"messages"`
}

type CallElement struct {
	// example: 5162
	ID int64 `json:"id"`
	// example: wvn6zg@127.0.0.1
	Sid string `json:"sid"`
	// example: 179.12.245.132
	DstHost string `json:"dstHost"`
	// example: 18.12.245.132
	SrcHost string `json:"srcHost"`
	// example: 179.12.245.132:5060
	DstID string `json:"dstId"`
	// example: 18.12.245.132:5060
	SrcID string `json:"srcId"`
	// example: 18.12.245.132
	SrcIP string `json:"srcIp"`
	// example: 179.12.245.132
	DstIP string `json:"dstIp"`
	// example: 5060
	SrcPort int `json:"srcPort"`
	// example: Client
	AliasSrc string `json:"aliasSrc"`
	// example: Support
	AliasDst string `json:"aliasDst"`
	// example: 5060
	DstPort int `json:"dstPort"`
	// example: INVITE
	Method string `json:"method"`
	// example: INVITE
	MethodText string `json:"method_text"`
	// example: 1633374982350
	CreateDate int64 `json:"create_date"`
	// example: 17
	Protocol int `json:"protocol"`
	// example: blue
	MsgColor string `json:"msg_color"`
	Table    string `json:"table"`
	// example: INVITE sip:155@example.com;user=phone SIP/2.0\r\n
	RuriUser string `json:"ruri_user"`
	// example: 1
	Destination int `json:"destination"`
	// example: 1633374982350
	MicroTs int64 `json:"micro_ts"`
}

type TransactionElement struct {
	ViaBranch string        `json:"via_branch"`
	Name      string        `json:"name"`
	ErrorName string        `json:"error_name"`
	BeginDate int64         `json:"begin_date"`
	FromUser  string        `json:"from_user"`
	ToUser    string        `json:"to_user"`
	Host      []string      `json:"host"`
	CallData  []CallElement `json:"call_data"`
}

// swagger:model SearchTransactionLog
type SearchTransactionLog struct {
	// example: "2001"
	CaptureID string `json:"captureId"`
	// example: myHep
	CapturePass string `json:"capturePass"`
	// example: wvn6zg@127.0.0.1
	Correlation_id string `json:"correlation_id"`
	// example: 021-10-04T19:16:22.699Z
	Create_date string `json:"create_date"`
	// example: localnode
	Dbnode string `json:"dbnode"`
	// example: 127.0.0.1
	DstIP string `json:"dstIp"`
	// example: 127.0.0.1
	SrcIP string `json:"srcIp"`
	// example: 5060
	DstPort float64 `json:"dstPort"`
	// example: 5080
	SrcPort float64 `json:"srcPort"`
	// example: 1030
	ID float64 `json:"id"`
	// example: 100
	PayloadType int `json:"payloadType"`

	Profile string `json:"profile"`
	// example: log
	Proto string `json:"proto"`
	// example: 17
	Protocol int `json:"protocol"`
	// example: 2
	ProtocolFamily int    `json:"protocolFamily"`
	Raw            string `json:"raw"`
	// example: wvn6zg@127.0.0.1
	Sid string `json:"sid"`
	// example: 1633374982
	TimeSeconds int `json:"timeSeconds"`
	// example: 699000
	TimeUseconds int `json:"timeUseconds"`
	// example: ["2001", "localnode"]
	Node []string `json:"node"`
}

//swagger:model SearchTransactionLogList
type SearchTransactionLogList struct {
	Data []SearchTransactionLog `json:"data"`
}

// swagger:model SearchTransactionRtcp
type SearchTransactionRtcp struct {
	// example: "2001"
	CaptureID string `json:"captureId"`
	// example: myHep
	CapturePass string `json:"capturePass"`
	// example: wvn6zg@127.0.0.1
	Correlation_id string `json:"correlation_id"`
	// example: 021-10-04T19:16:22.699Z
	Create_date string `json:"create_date"`
	// example: localnode
	Dbnode string `json:"dbnode"`
	// example: 127.0.0.1
	DstIP string `json:"dstIp"`
	// example: 127.0.0.1
	SrcIP string `json:"srcIp"`
	// example: 5060
	DstPort float64 `json:"dstPort"`
	// example: 5080
	SrcPort float64 `json:"srcPort"`
	// example: 1030
	ID float64 `json:"id"`
	// example: 100
	PayloadType int `json:"payloadType"`

	Profile string `json:"profile"`
	// example: log
	Proto string `json:"proto"`
	// example: 17
	Protocol int `json:"protocol"`
	// example: 2
	ProtocolFamily int    `json:"protocolFamily"`
	Raw            string `json:"raw"`
	// example: wvn6zg@127.0.0.1
	Sid string `json:"sid"`
	// example: 1633374982
	TimeSeconds int `json:"timeSeconds"`
	// example: 699000
	TimeUseconds int `json:"timeUseconds"`
	// example: ["2001", "localnode"]
	Node []string `json:"node"`
}

//swagger:model SearchTransactionRtpList
type SearchTransactionRtcpList struct {
	Data []SearchTransactionRtcp `json:"data"`
}

// swagger:model SearchTransactionRtp
type SearchTransactionRtp struct {
	// example: 2001
	CaptureID string `json:"captureId"`
	// example: myHep
	CapturePass string `json:"capturePass"`
	// example: wvn6zg@127.0.0.1
	Correlation_id string `json:"correlation_id"`
	// example: 021-10-04T19:16:22.699Z
	Create_date string `json:"create_date"`
	// example: localnode
	Dbnode string `json:"dbnode"`
	// example: 127.0.0.1
	DstIP string `json:"dstIp"`
	// example: 127.0.0.1
	SrcIP string `json:"srcIp"`
	// example: 5060
	DstPort float64 `json:"dstPort"`
	// example: 5080
	SrcPort float64 `json:"srcPort"`
	// example: 1030
	ID float64 `json:"id"`
	// example: 100
	PayloadType int `json:"payloadType"`

	Profile string `json:"profile"`
	// example: log
	Proto string `json:"proto"`
	// example: 17
	Protocol int `json:"protocol"`
	// example: 2
	ProtocolFamily int    `json:"protocolFamily"`
	Raw            string `json:"raw"`
	// example: wvn6zg@127.0.0.1
	Sid string `json:"sid"`
	// example: 1633374982
	TimeSeconds int `json:"timeSeconds"`
	// example: 699000
	TimeUseconds int `json:"timeUseconds"`
	// example: ["2001", "localnode"]
	Node []string `json:"node"`
}

//swagger:model SearchTransactionRtpList
type SearchTransactionRtpList struct {
	Data []SearchTransactionRtp `json:"data"`
}

//swagger:model SearchTransactionQos
type SearchTransactionQos struct {
	Rtcp SearchTransactionRtcpList `json:"rtcp"`
	Rtp  SearchTransactionRtpList  `json:"rtp"`
}

//swagger:model PCAPResponse
type PCAPResponse struct {
	// In: body
	File os.File
}

//swagger:model TextResponse
type TextResponse struct {
	// In: body
	File os.File
}

//swagger:model SearchTransaction
type SearchTransaction struct {
	Data struct {
		// example: {127.0.0.1: localhost, 100.20.15.1: party1}
		Alias    map[string]string `json:"alias"`
		Calldata []CallElement     `json:"calldata"`
	} `json:"data"`
	// example: ["callid", "srcIp", "srcPort"]
	Keys  []string `json:"keys"`
	Total int      `json:"total"`
}

//swagger:model SearchTransactionRequest
type SearchTransactionRequest struct {
	Config struct {
		Protocol_id struct {
			// example: SIP
			Name string `json:"name"`
			// example: 1
			Value int `json:"value"`
		} `json:"protocol_id"`
		Protocol_profile struct {
			// example: call
			Name string `json:"name"`
			// example: call
			Value string `json:"value"`
		} `json:"protocol_profile"`
	} `json:"config"`
	// required: true
	Param struct {
		Transaction struct {
		} `json:"transaction"`
		// this controls the number of records to display
		// example: 200
		// required: true
		Limit int `json:"limit"`
		// this control the type of search one can perform
		// type: string
		// format: binary
		// example: `{"1_call":[{"name":"limit","value":"10","type":"string","hepid":1}]}`
		Search json.RawMessage `json:"search"`
		// this control the type of search one can perform
		// type: boolean
		// example: false
		OrLogic bool `json:"orlogic"`
		// ips to be removed from search
		// required: false
		// type: array
		// items:
		//  type: string
		// 	example: ["192.1698.10.20"]
		WhiteList []string `json:"whitelist"`
		// location
		// required: false
		// type: object
		Location struct {
			Node []string `json:"node"`
		} `json:"location"`
		// timezone settings
		// type: object
		// default: null
		Timezone struct {
			Value int    `json:"value"`
			Name  string `json:"name"`
		} `json:"timezone"`
	} `json:"param"`
	// this control the time range for used for search
	Timestamp struct {
		// current timestamp in miliseconds
		// required :true
		// example: 1581793200000
		From int64 `json:"from"`
		// current timestamp in miliseconds
		// required :true
		// example: 1581879599000
		To int64 `json:"to"`
	} `json:"timestamp"`
}

//swagger:model SearchCallData
type SearchCallData struct {
	Data []CallElement `json:"data"`
	// example: ["callid", "srcIp", "srcPort"]
	Keys []string `json:"keys"`
	// example: 45
	Total int `json:"total"`
}

//swagger:model MessageDecoded
type MessageDecoded struct {
	Data []struct {
		Decoded []struct {
			// example: packets-2021-10-08
			_index string
			Source struct {
				Layers struct {
					Eth struct {
						// example: 06:3d:20:12:10:20
						Dst      string `json:"eth.dst"`
						Dst_tree struct {
							// example: 06:3d:20:12:10:20
							Add string `json:"eth.addr"`
							// example: 06:3d:20:12:10:20
							Addr_resolved string `json:"eth.addr_resolved"`
							// example: 06:3d:20:12:10:20
							Dst_resolved string `json:"eth.dst_resolved"`
							// example: 0
							Ig string `json:"eth.ig"`
							// example: 1
							Lg string `json:"eth.lg"`
						} `json:"eth.dst_tree"`

						// example: 02:5d:69:74:20:12
						Src      string `json:"eth.src"`
						Src_tree struct {
							// example: 02:5d:69:74:20:12
							Addr string `json:"eth.addr"`
							// example: 02:5d:69:74:20:12
							Addr_resolved string `json:"eth.addr_resolved"`
							// example: 0
							Ig string `json:"eth.ig"`
							// example: 1
							Lg string `json:"eth.lg"`
							// example: 02:5d:69:74:20:12
							Src_resolved string `json:"src_resolved"`
						} `json:"eth.src_tree"`
						// example:"0x00000800"
						Type string `json:"eth.type"`
					} `json:"eth"`
					Frame struct {
						// example: 1058
						Cap_len string `json:"frame.cap_len"`
						// example: 1
						Encap_type string `json:"frame.encap_type"`
						// example: 0
						Ignored string `json:"frame.ignored"`
						// example: 0
						Interface_id string `json:"frame.interface_id"`
						// example:
						Interface_id_tree struct {
							// example: -
							Interface_name string `json:"frame.interface_name"`
						} `json:"frame.interface_id_tree"`
						// example: 1058
						Len string `json:"frame.len"`
						// example: 0
						Marked string `json:"frame.marked"`
						// example: 1
						Number string `json:"frame.number"`
						// example: 0.000000000
						Offset_shift string `json:"frame.offset_shift"`
						// example: eth:ethertype:ip:udp:sip:sdp
						Protocols string `json:"frame.protocols"`
						// example: Sep 30, 2021 07:06:10.950000000 UTC
						Time string `json:"frame.time"`
						// example: 0.000000000
						Time_delta string `json:"frame.time_delta"`
						// example: 0.000000000
						Time_delta_displayed string `json:"frame.time_delta_displayed"`
						// example: 1632985570.950000000
						Time_epoch string `json:"frame.time_epoch"`
						// example: 0.000000000
						Time_relative string `json:"frame.time_relative"`
					} `json:"frame"`
					Ip struct {
						// example: 0x0000ffa5
						Checksum string `json:"ip.checksum"`
						// example: 0x0000ffa5
						Dsfield      string `json:"ip.dsfield"`
						Dsfield_tree struct {
							// example: 0
							Dscp string `json:"ip.dsfield_tree.dscp"`
							// example: 0
							Ecn string `json:"ip.dsfield_tree.ecn"`
						} `json:"ip.dsfield_tree"`
						// example: 127.0.0.1
						Dst string `json:"ip.dst"`
						// example: 127.0.0.1
						Dst_host string `json:"ip.dst_host"`
						// example: 0x00000000
						Flags      string `json:"ip.flags"`
						Flags_tree struct {
							// example: 0
							Df string `json:"ip.flags_tree.df"`
							// example: 0
							Mf string `json:"ip.flags_tree.mf"`
							// example: 0
							Rb string `json:"ip.flags_tree.rb"`
						} `json:"ip.flags_tree"`

						// example: 0
						Frag_offset string `json:"ip.frag_offset"`
						// example: 20
						Hdr_len string `json:"ip.hdr_len"`
						// example: 127.0.0.1
						Host string `json:"ip.host"`
						// example: 127.0.0.1
						Src string `json:"ip.src"`
						// example: 127.0.0.1
						Src_host string `json:"ip.src_host"`
						// example: 0x00000000
						Id string `json:"ip.id"`
						// example: 2
						ChceksumStatus string `json:"ip.checksum.status"`
						// example: 1044
						Len string `json:"ip.len"`
						// example: 17
						Proto string `json:"ip.proto"`
						// example: 54
						Ttl string `json:"ip.ttl"`
						// example: 4
						Version string `json:"ip.version"`
					} `json:"ip"`
					Sip struct {
						// example: INVITE sip:196@example.com;user=phone SIP/2.0
						Request_line      string `json:"sip.Request-line"`
						Request_line_tree struct {
							//example: INVITE
							Method string `json:"sip.Method"`
							//example: sip:196@example.com;user=phone
							Ruri      string `json:"sip.r-uri"`
							Ruri_tree struct {
								//example: example.com
								Host string `json:"sip.r-uri.host"`
								//example: 196
								User string `json:"sip.r-uri.user"`
							} `json:"sip.Request-line_tree"`
							//example: 0
							Resend string `json:"sip.resend"`
						} `json:"sip.Request-line_tree"`
						Msg_body struct {
							//example: "IN IP4 192.168.10.193"
							Connection_info      string `json:"sdp.connection_info"`
							Connection_info_tree struct {
								// example: 192.168.10.193
								Address string `json:"sdp.connection_info.address"`
								// example: IP4
								Address_type string `json:"sdp.connection_info.address_type"`
								// example: IN
								Network_type string `json:"sdp.connection_info.network_type"`
							} `json:"sip.connection_info_tree"`
							// example: audio 5004 RTP/AVP 0 8 9 18 101
							Media string `json:"sdp.media"`
							// example: fmtp:101 0-15
							Media_attr      string `json:"sdp.media_attr"`
							Media_attr_tree struct {
								// example: 0-15
								Parameter string `json:"sdp.fmtp.parameter"`
								// example: 101
								Format string `json:"sdp.media.format"`
								// example: fmtp
								Field string `json:"sdp.media_attribute.field"`
							} `json:"sdp.media_attr_tree"`
							Media_tree struct {
								// example: DynamicRTP-Type-101
								Fromat string `json:"sdp.media.format"`
								// example: audio
								Media string `json:"sdp.media.media"`
								// example: 5004
								Port string `json:"sdp.media.port"`
								// example: 5004
								Port_string string `json:"sdp.media.port_string"`
								// example: RTP/AVP
								Proto string `json:"sdp.media.proto"`
							} `json:"sdp.media_tree"`
							// example: hepgenjs 8000 8000 IN IP4 192.168.10.193
							Owner      string `json:"sdp.owner"`
							Owner_tree struct {
								// example: 192.168.10.193
								Address string `json:"sdp.owner.address"`
								// example:  IP4
								Address_type string `json:"sdp.owner.address_type"`
								// example:  IN
								Network_type string `json:"sdp.owner.network_type"`
								// example: 8000
								SessionID string `json:"sdp.owner.sessionid"`
								// example:  hepgenjs
								Username string `json:"sdp.owner.username"`
								// example: 8000
								Version string `json:"sdp.owner.version"`
							} `json:"sdp.owner_tree"`
							// example: "SIP Call"
							Session_name string `json:"sdp.session_name"`
							// example: "0 0"
							Time      string `json:"sdp.time"`
							Time_tree struct {
								// example: 0
								Start string `json:"sdp.time.start"`
								// example: 0
								Stop string `json:"sdp.time.stop"`
							} `json:"sdp.time_tree"`
							// example: 0
							Version string `json:"sdp.version"`
						} `json:"sip.msg_body"`
						// example: "Via: SIP/2.0/UDP 192.168.10.193:5064;branch=z9hG4bK923381359;rport\r\nFrom: <sip:hepgenjs@example.com;user=phone>;tag=415746302\r\nTo: <sip:196@example.com;user=phone>\r\nCall-ID: a6xh18@127.0.0.1\r\nCSeq: 440 INVITE\r\nContact: <sip:hepgenjs@192.168.10.193:5064;user=phone>\r\nMax-Forwards: 70\r\nUser-Agent: HEPGEN.JS@example.com\r\nPrivacy: none\r\nP-Preferred-Identity: <sip:hepgenjs@example.com;user=phone>\r\nSupported: replaces, path, timer, eventlist\r\nAllow: INVITE, ACK, OPTIONS, CANCEL, BYE, SUBSCRIBE, NOTIFY, INFO, REFER, UPDATE, MESSAGE\r\nContent-Type: application/sdp\r\nAccept: application/sdp, application/dtmf-relay\r\nContent-Length:   313\r\n\r\nv=0\r\no=hepgenjs 8000 8000 IN IP4 192.168.10.193\r\ns=SIP Call\r\nc=IN IP4 192.168.10.193\r\nt=0 0\r\nm=audio 5004 RTP/AVP 0 8 9 18 101\r\na=sendrecv\r\na=rtpmap:0 PCMU/8000\r\na=ptime:20\r\na=rtpmap:8 PCMA/8000\r\na=rtpmap:9 G722/8000\r\na=rtpmap:18 G729/8000\r\na=fmtp:18 annexb=no\r\na=rtpmap:101 telephone-event/8000\r\na=fmtp:101 0-15\r\n\r\n\r\n"
						Msg_hdr       string `json:"sip.msg_hdr"`
						RMsg_hdr_tree struct {
						} `json:"sip.msg_hdr_tree"`
					} `json:"sip"`
					Udp struct {
						// example: 0x0000ffa5
						Checksum string `json:"udp.checksum"`
						// example: 2
						ChceksumStatus string `json:"udp.checksum.status"`
						// example: 5060
						Dstport string `json:"udp.dstport"`
						// example: 1024
						Length string `json:"udp.length"`
						// example: 5060
						Port string `json:"udp.port"`
						// example: 5060
						Srcport string `json:"udp.srcport"`
						// example: 0
						Stream string `json:"udp.stream"`
					} `json:"udp"`
				} `json:"_layers"`
			} `json:"_source"`
			// example: pcap_file
			Type string `json:"_type"`
		} `json:"decoded"`
	} `json:"data"`
}
