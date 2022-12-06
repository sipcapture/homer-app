package webmessages

// Messages Codes System
const (
	PleaseTryAgain  = "Please Try Again"
	OperationFailed = "Operation Failed"
)

// Messages Codes for Users
const (
	UserRequestFailed           = "failed to get Users"
	UserSettingsFailed          = "failed to get user settings"
	UserProfileFailed           = "failed to get user profile"
	MappingHepSubFailed         = "failed to get hepsub mapping schema"
	InsertDashboardFailed       = "failed to create a new dashboard"
	GetDashboardFailed          = "failed to get dashboards"
	GetDashboardListFailed      = "failed to get of list of dashboards"
	GetDBNodeListFailed         = "failed to get list of db nodes"
	DeleteDashboardFailed       = "failed to delete the dashboard"
	MappingSchemaFailed         = "failed to get mapping schema"
	HepSubRequestFailed         = "failed to get hep sub schema"
	MappingRecreateFailed       = "failed to recreated all mappings"
	GetAgentSubFailed           = "failed to get agent sub"
	GetAuthTokenFailed          = "failed to get auth token"
	DeleteAdvancedAgainstFailed = "failed to delete advanced setting"
	GetAdvancedAgainstFailed    = "failed to get advanced setting"
	MappingSchemaByUUIDFailed   = "failed to get mapping schema by uuid"
	DeleteMappingSchemaFailed   = "failed to delete mapping schema"
	SmartHepProfileFailed       = "failed to get smart hep profile"
	DashboardNotExists          = "dashboard for the user doesn't exist"
	HomeDashboardNotExists      = "home dashboard for the user doesn't exist"
	Unauthorized                = "Unauthorized"
	IncorrectPassword           = "incorrect password"
	UserCreationFailed          = "failed to Create User"
	SuccessfullyCreatedUser     = "successfully created user"
	UserRequestFormatIncorrect  = "request format is not correct"
	UIVersionFileNotExistsError = "error version file couldn't be found"
	SwaggerFileNotExistsError   = "swagger file couldn't be found"
	BadPCAPData                 = "bad pcap data"
	BadDatabaseRetrieve         = "db data retrieve error"
	GrafanaProcessingError      = "grafana returned"
)
