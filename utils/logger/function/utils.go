package function

import "github.com/Jeffail/gabs/v2"

func KeyExits(value interface{}, keyMap []interface{}) bool {
	for _, v := range keyMap {
		if value == v {
			return true
		}
	}
	return false
}

func ArrayKeyExits(key string, dataKeys *gabs.Container) bool {
	for _, v := range dataKeys.Children() {
		if key == v.Data().(string) {
			return true
		}
	}
	return false
}
