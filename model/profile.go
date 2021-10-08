package model

// swagger:model Node
type Node struct {
	// example: false
	Arhive bool `json:"arhive"`
	// example: hepic_archive
	Db_archive string `json:"db_archive"`
	// example: hepic_data
	Db_name string `json:"db_name"`
	// example: 148.251.238.121
	Host string `json:"host"`
	// example: DE7 Node
	Name string `json:"name"`
	// example: ""
	Node string `json:"node"`
	// example: true
	Online bool `json:"online"`
	// example: false
	Primary      bool   `json:"primary"`
	Table_prefix string `json:"table_prefix"`
	// example: de7node
	Value string `json:"value"`
}

// swagger:model NodeList
type NodeList struct {
	Data []Node `json:"data"`
	// example: 1
	Count int `json:"count"`
}
