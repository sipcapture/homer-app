// +build gofuzz

package sipparser

func Fuzz(data []byte) int {
	ParseMsg(string(data))
	return 0
}
