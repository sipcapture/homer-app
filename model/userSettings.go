package model

type CorrelationMap struct {
	SourceField   string `json:"source_field"`
	LookupID      int    `json:"lookup_id"`
	LookupProfile string `json:"lookup_profile"`
	LookupField   string `json:"lookup_field"`
	LookupRange   []int  `json:"lookup_range"`
}
