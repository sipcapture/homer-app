package model

type CorrelationMap struct {
	SourceField   string `json:"source_field"`
	LookupID      int    `json:"lookup_id"`
	LookupProfile string `json:"lookup_profile"`
	LookupField   string `json:"lookup_field"`
	LookupRange   []int  `json:"lookup_range"`
}

// swagger:model UserSetting
type UserSetting struct {
	// example: dashboard
	Category string           `json:"category"`
	Data     DashBoardElement `json:"data,omitempty"`
	// example: 1868f318-5f16-4c40-ab1e-bfa4f417ff61
	GUID string `json:"guid"`
	// example: 59
	ID int `json:"id"`
	// example:_1633964934444
	Param string `json:"param"`
	// example: 10
	Partid int `json:"partid"`
	// example: admin
	Username string `json:"username"`
}

// swagger:model UserSettingList
type UserSettingList struct {
	Data []UserSetting `json:"data"`
	// example: 7
	Count int `json:"count"`
}

// swagger:model UserSettingCreateSuccessfulResponse
type UserSettingCreateSuccessfulResponse struct {
	// example: f4e2953e-ab42-40df-a7de-9ceb7faca396
	Data string `json:"data"`
	// example: successfully created userObject
	Message string `json:"message"`
}

// swagger:model UserSettingDeleteSuccessfulResponse
type UserSettingDeleteSuccessfulResponse struct {
	// example: f4e2953e-ab42-40df-a7de-9ceb7faca396
	Data string `json:"data"`
	// example: successfully deleted userObject
	Message string `json:"message"`
}

// swagger:model UserSettingUpdateSuccessfulResponse
type UserSettingUpdateSuccessfulResponse struct {
	// example: f4e2953e-ab42-40df-a7de-9ceb7faca396
	Data string `json:"data"`
	// example: successfully updated userObject"
	Message string `json:"message"`
}
