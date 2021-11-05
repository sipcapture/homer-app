package exportwriter

import (
	"bytes"
	"encoding/binary"
	"fmt"
	"net"
	"strconv"
	"time"

	"github.com/Jeffail/gabs/v2"
	"github.com/google/gopacket"
	"github.com/google/gopacket/layers"
	"github.com/sipcapture/homer-app/utils/heputils"
	"github.com/sipcapture/homer-app/utils/logger"
)

//
type ExportElement struct {
	SrcIP        string  `json:"srcIp"`
	DstIP        string  `json:"dstIp"`
	SrcPort      float64 `json:"srcPort"`
	DstPort      float64 `json:"dstPort"`
	CreateDate   string  `json:"create_date"`
	ProtocolType float64 `json:"protocol_type"`
	ProtocolText string  `json:"protocol_text"`
	PayloadType  float64 `json:"payload_type"`
	PayloadText  string  `json:"payload_text"`
	Message      string  `json:"msg_color"`
	TimeSeconds  float64 `json:"timeSeconds"`
	TimeUseconds float64 `json:"timeUSeconds"`
	CaptureID    float64 `json:"capture_id"`
}

// Writer wraps an underlying o.Writer to write packet data in PCAP
// format.  See http://wiki.wireshark.org/Development/LibpcapFileFormat
// for information on the file format.
//
// For those that care, we currently write v2.4 files with nanosecond
// or microsecond timestamp resolution and little-endian encoding.
type Writer struct {
	Buffer   bytes.Buffer
	tsScaler int
	// Moving this into the struct seems to save an allocation for each call to writePacketHeader
	buf [16]byte
}

const magicNanoseconds = 0xA1B23C4D
const magicMicroseconds = 0xA1B2C3D4
const versionMajor = 2
const versionMinor = 4

func NewWriterNanos(buf bytes.Buffer) *Writer {
	return &Writer{Buffer: buf, tsScaler: nanosPerNano}
}

func NewWriter(buf bytes.Buffer) *Writer {
	return &Writer{Buffer: buf, tsScaler: nanosPerMicro}
}

// WriteDataToBuffer writes a file header out to the writer.
// This must be called exactly once per output.
func (w *Writer) createExportElementfromGab(h *gabs.Container) (*ExportElement, error) {

	packet := ExportElement{
		SrcIP:        "127.0.0.1",
		DstIP:        "127.0.0.2",
		SrcPort:      0,
		DstPort:      0,
		CreateDate:   "",
		ProtocolType: 17,
		ProtocolText: "UDP",
		PayloadType:  1,
		PayloadText:  "SIP",
		Message:      "",
		TimeSeconds:  0,
		TimeUseconds: 0,
		CaptureID:    0,
	}

	if h.Exists("protocol_header", "payloadType") {
		packet.PayloadType = heputils.CheckFloatValue(h.S("protocol_header", "payloadType").Data())
		packet.PayloadText, _ = heputils.ConvertPayloadTypeToString(packet.PayloadType)
	}

	if h.Exists("protocol_header", "protocol") {
		packet.ProtocolType = heputils.CheckFloatValue(h.S("protocol_header", "protocol").Data())
		packet.ProtocolText = heputils.ConvertProtoTypeToString(packet.ProtocolType)
	}

	if h.Exists("create_date") {
		packet.CreateDate = h.S("create_date").Data().(string)
	}

	if h.Exists("protocol_header", "captureId") {
		packet.CaptureID = heputils.CheckFloatValue(h.S("protocol_header", "captureId").Data())
	}

	if h.Exists("protocol_header", "srcIp") {
		packet.SrcIP = h.S("protocol_header", "srcIp").Data().(string)
	}
	if h.Exists("protocol_header", "srcPort") {
		packet.SrcPort = heputils.CheckFloatValue(h.S("protocol_header", "srcPort").Data())
	}

	if h.Exists("protocol_header", "dstIp") {
		packet.DstIP = h.S("protocol_header", "dstIp").Data().(string)
	}
	if h.Exists("protocol_header", "dstPort") {
		packet.DstPort = heputils.CheckFloatValue(h.S("protocol_header", "dstPort").Data())
	}
	if h.Exists("protocol_header", "timeSeconds") {
		packet.TimeSeconds = heputils.CheckFloatValue(h.S("protocol_header", "timeSeconds").Data())
	}
	if h.Exists("protocol_header", "timeUseconds") {
		packet.TimeUseconds = heputils.CheckFloatValue(h.S("protocol_header", "timeUseconds").Data())
	}
	if h.Exists("raw") {
		packet.Message = h.S("raw").Data().(string)
	}

	return &packet, nil
}

// WriteDataToBuffer writes a file header out to the writer.
// This must be called exactly once per output.
func (w *Writer) WriteDataToBuffer(h *gabs.Container) error {

	packet, _ := w.createExportElementfromGab(h)

	w.Buffer.WriteString("proto:" + packet.ProtocolText + " " + packet.CreateDate + "  " +
		packet.SrcIP + ":" + strconv.FormatFloat(packet.SrcPort, 'f', 0, 64) +
		" ---> " + packet.DstIP + ":" + strconv.FormatFloat(packet.DstPort, 'f', 0, 64) + "\r\n\r\n")
	w.Buffer.WriteString(packet.Message)
	_, err := w.Buffer.WriteString("\r\n")

	return err
}

// WriteDataToBuffer writes a file header out to the writer.
// This must be called exactly once per output.
func (w *Writer) WriteDataPcapBuffer(h *gabs.Container) error {

	var capInfo gopacket.CaptureInfo
	packet, _ := w.createExportElementfromGab(h)

	if packet.TimeSeconds == 0 {
		capInfo.Timestamp = time.Unix(int64(packet.TimeSeconds), int64(packet.TimeUseconds))
	} else {
		capInfo.Timestamp, _ = time.Parse(time.RFC3339, packet.CreateDate)
	}
	capInfo.InterfaceIndex = 1
	ethTypeSource := layers.EthernetTypeIPv4
	ethTypeDestination := layers.EthernetTypeIPv4

	/* test if SrcHost is IPv6 */
	testInput := net.ParseIP(packet.SrcIP)
	if testInput.To4() == nil && testInput.To16() != nil {
		ethTypeSource = layers.EthernetTypeIPv6
	}

	logger.Debug("source IP ["+packet.SrcIP+"], type: ", ethTypeSource)

	/* test if DstHost is IPv6 */
	testInput = net.ParseIP(packet.DstIP)
	if testInput.To4() == nil && testInput.To16() != nil {
		ethTypeDestination = layers.EthernetTypeIPv6
	}

	logger.Debug("destination IP ["+packet.DstIP+"], type: ", ethTypeDestination)

	ethTypeFinal := layers.EthernetTypeIPv4

	if ethTypeSource == layers.EthernetTypeIPv6 && ethTypeDestination == layers.EthernetTypeIPv6 {
		ethTypeFinal = layers.EthernetTypeIPv6
	}

	ethernetLayer := &layers.Ethernet{
		SrcMAC:       net.HardwareAddr{0x02, 0x5d, 0x69, 0x74, 0x20, 0x12},
		DstMAC:       net.HardwareAddr{0x06, 0x3d, 0x20, 0x12, 0x10, 0x20},
		EthernetType: ethTypeFinal,
	}

	buffer := gopacket.NewSerializeBuffer()
	opts := gopacket.SerializeOptions{
		FixLengths:       true,
		ComputeChecksums: true,
	}

	if ethTypeFinal == layers.EthernetTypeIPv4 {

		var ipLayer *layers.IPv4
		var ipLayerv6 *layers.IPv6

		if ethTypeSource == layers.EthernetTypeIPv4 && ethTypeDestination == layers.EthernetTypeIPv4 {
			ipLayer = &layers.IPv4{
				SrcIP:    net.ParseIP(packet.SrcIP),
				DstIP:    net.ParseIP(packet.DstIP),
				Version:  4,
				TTL:      54,
				Protocol: layers.IPProtocolUDP,
			}
			//this is a workaround for mix IPv4 and IPv6 source and destination. Normaly it should never happend
		} else if ethTypeSource == layers.EthernetTypeIPv6 && ethTypeDestination == layers.EthernetTypeIPv4 {

			ipLayer = &layers.IPv4{
				SrcIP:    net.ParseIP(packet.DstIP),
				DstIP:    net.ParseIP(packet.DstIP),
				Version:  4,
				TTL:      54,
				Protocol: layers.IPProtocolIPv6,
			}

			ipLayerv6 = &layers.IPv6{
				SrcIP:      net.ParseIP(packet.SrcIP),
				DstIP:      net.ParseIP(packet.SrcIP),
				Version:    6,
				HopLimit:   64,
				NextHeader: layers.IPProtocolUDP,
			}
		} else if ethTypeSource == layers.EthernetTypeIPv4 && ethTypeDestination == layers.EthernetTypeIPv6 {

			ipLayer = &layers.IPv4{
				SrcIP:    net.ParseIP(packet.SrcIP),
				DstIP:    net.ParseIP(packet.SrcIP),
				Version:  4,
				TTL:      54,
				Protocol: layers.IPProtocolIPv6,
			}

			ipLayerv6 = &layers.IPv6{
				SrcIP:      net.ParseIP(packet.DstIP),
				DstIP:      net.ParseIP(packet.DstIP),
				Version:    6,
				HopLimit:   64,
				NextHeader: layers.IPProtocolUDP,
			}
		}

		udpLayer := &layers.UDP{
			SrcPort: layers.UDPPort(packet.SrcPort),
			DstPort: layers.UDPPort(packet.DstPort),
		}

		err := udpLayer.SetNetworkLayerForChecksum(ipLayer)
		if err != nil {
			return nil
		}

		if ipLayerv6 != nil {
			err = gopacket.SerializeLayers(buffer, opts,
				ethernetLayer, ipLayer, ipLayerv6, udpLayer,
				gopacket.Payload(packet.Message),
			)
		} else {
			err = gopacket.SerializeLayers(buffer, opts,
				ethernetLayer, ipLayer, udpLayer,
				gopacket.Payload(packet.Message),
			)
		}

		if err != nil {
			logger.Error("bad serialize layer for IPv4 = ", err)
			return err
		}

	} else {

		ipLayer := &layers.IPv6{
			SrcIP:      net.ParseIP(packet.SrcIP),
			DstIP:      net.ParseIP(packet.DstIP),
			Version:    6,
			HopLimit:   64,
			NextHeader: layers.IPProtocolUDP,
		}

		udpLayer := &layers.UDP{
			SrcPort: layers.UDPPort(packet.SrcPort),
			DstPort: layers.UDPPort(packet.DstPort),
		}

		err := udpLayer.SetNetworkLayerForChecksum(ipLayer)
		if err != nil {
			return nil
		}

		err = gopacket.SerializeLayers(buffer, opts,
			ethernetLayer, ipLayer, udpLayer,
			gopacket.Payload(packet.Message),
		)

		if err != nil {
			logger.Error("bad serialize layer for IPv6 = ", err)
			return err
		}
	}

	capInfo.Length = len(buffer.Bytes())
	capInfo.CaptureLength = capInfo.Length

	err := w.WritePcapPacket(capInfo, buffer.Bytes())

	if err != nil {
		logger.Error("bad WritePcapPacket = ", err)
	}

	return err
}

// WriteFileHeader writes a file header out to the writer.
// This must be called exactly once per output.
func (w *Writer) WritePcapHeader(snaplen uint32, linkType uint32) error {
	var buf [24]byte
	if w.tsScaler == nanosPerMicro {
		binary.LittleEndian.PutUint32(buf[0:4], magicMicroseconds)
	} else {
		binary.LittleEndian.PutUint32(buf[0:4], magicNanoseconds)
	}
	binary.LittleEndian.PutUint16(buf[4:6], versionMajor)
	binary.LittleEndian.PutUint16(buf[6:8], versionMinor)
	// bytes 8:12 stay 0 (timezone = UTC)
	// bytes 12:16 stay 0 (sigfigs is always set to zero, according to
	//   http://wiki.wireshark.org/Development/LibpcapFileFormat
	binary.LittleEndian.PutUint32(buf[16:20], snaplen)
	binary.LittleEndian.PutUint32(buf[20:24], uint32(linkType))
	_, err := w.Buffer.Write(buf[:])
	return err
}

const nanosPerMicro = 1000
const nanosPerNano = 1

func (w *Writer) writePcapPacketHeader(ci gopacket.CaptureInfo) error {
	t := ci.Timestamp
	if t.IsZero() {
		t = time.Now()
	}
	secs := t.Unix()
	usecs := t.Nanosecond() / w.tsScaler
	binary.LittleEndian.PutUint32(w.buf[0:4], uint32(secs))
	binary.LittleEndian.PutUint32(w.buf[4:8], uint32(usecs))
	binary.LittleEndian.PutUint32(w.buf[8:12], uint32(ci.CaptureLength))
	binary.LittleEndian.PutUint32(w.buf[12:16], uint32(ci.Length))
	_, err := w.Buffer.Write(w.buf[:])
	return err
}

// WritePacket writes the given packet data out to the file.
func (w *Writer) WritePcapPacket(ci gopacket.CaptureInfo, data []byte) error {
	if ci.CaptureLength != len(data) {
		return fmt.Errorf("capture length %d does not match data length %d", ci.CaptureLength, len(data))
	}
	if ci.CaptureLength > ci.Length {
		return fmt.Errorf("invalid capture info %+v:  capture length > length", ci)
	}
	if err := w.writePcapPacketHeader(ci); err != nil {
		return fmt.Errorf("error writing packet header: %v", err)
	}
	_, err := w.Buffer.Write(data)
	return err
}
