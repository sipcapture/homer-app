package migration

import (
	"fmt"
	"time"

	"github.com/jinzhu/gorm"
	"github.com/lib/pq"
	"github.com/sipcapture/homer-app/migration/jsonschema"
	"github.com/sipcapture/homer-app/model"
	"github.com/sipcapture/homer-app/utils/heputils"
	"github.com/sipcapture/homer-app/utils/logger"
	"golang.org/x/crypto/bcrypt"
)

type RollesTable struct {
	Username   string `json:"Username"`
	Attributes string `json:"Attributes"`
}

// getSession creates a new root session and panics if connection error occurs
func GetDataRootDBSession(user *string, password *string, dbname *string, host *string, port *int, sslmode *string) (*gorm.DB, error) {

	//connectString := fmt.Sprintf("host=%s port=%d user=%s dbname=%s ssldmode=disable password=%s", *host, *port, *user, *dbname, *password)
	connectString := fmt.Sprintf("host=%s user=%s dbname=%s sslmode=%s", *host, *user, *dbname, *sslmode)

	if *port != 0 {
		connectString += fmt.Sprintf(" port=%d", *port)
	}

	if len(*password) != 0 {
		connectString += fmt.Sprintf(" password=%s", *password)
	}

	heputils.Colorize(heputils.ColorYellow, (fmt.Sprintf("\nCONNECT to DB ROOT STRING: [%s]\n", connectString)))

	db, err := gorm.Open("postgres", connectString)

	if err != nil {
		logger.Error(err)
		return nil, err
	}

	logger.Debug("----------------------------------- ")
	logger.Debug("*** Database Data Root Session created *** ")
	logger.Debug("----------------------------------- ")
	return db, nil
}

func CreateNewUser(dataRootDBSession *gorm.DB, user *string, password *string) {

	createString := fmt.Sprintf("\r\nHOMER - creating user [user=%s password=%s]", *user, *password)

	heputils.Colorize(heputils.ColorRed, createString)

	userQuoted := pq.QuoteIdentifier(*user)
	passwordQuoted := pq.QuoteLiteral(*password)

	sql := fmt.Sprintf("CREATE USER %s WITH PASSWORD %s", userQuoted, passwordQuoted)

	dataRootDBSession.Debug().Exec(sql)

	heputils.Colorize(heputils.ColorYellow, "\r\nDONE")

}

func DeleteNewUser(dataRootDBSession *gorm.DB, user *string) {

	createString := fmt.Sprintf("\r\nHOMER - delete user [user=%s]", *user)

	heputils.Colorize(heputils.ColorRed, createString)

	sql := fmt.Sprintf("DROP ROLE IF EXISTS %s", pq.QuoteIdentifier(*user))

	dataRootDBSession.Debug().Exec(sql)

	heputils.Colorize(heputils.ColorYellow, "\r\nDONE")
}

func CreateHomerDB(dataRootDBSession *gorm.DB, dbname *string, user *string) {

	createString := fmt.Sprintf("\r\nHOMER - create db [%s] with [name=%s]", *dbname, *user)

	heputils.Colorize(heputils.ColorRed, createString)

	sql := fmt.Sprintf("CREATE DATABASE %s OWNER %s", pq.QuoteIdentifier(*dbname), pq.QuoteIdentifier(*user))

	dataRootDBSession.Debug().Exec(sql)

	heputils.Colorize(heputils.ColorYellow, "\r\nDONE")
}

func CreateHomerRole(dataRootDBSession *gorm.DB, dataHomeDBSession *gorm.DB, user *string, homerDBconfig *string, homerDBdata *string) {

	createString := fmt.Sprintf("\r\nHOMER - creating role for user [user=%s dbconfig=%s, dbdata=%s]", *user, *homerDBconfig, *homerDBdata)

	heputils.Colorize(heputils.ColorRed, createString)

	userQuoted := pq.QuoteIdentifier(*user)
	homeDBConfigQuoted := pq.QuoteIdentifier(*homerDBconfig)
	homeDBDataQuoted := pq.QuoteIdentifier(*homerDBdata)

	sql := fmt.Sprintf("GRANT ALL PRIVILEGES ON DATABASE %s to %s;", homeDBConfigQuoted, userQuoted)
	dataRootDBSession.Debug().Exec(sql)

	sql = fmt.Sprintf("GRANT ALL PRIVILEGES ON DATABASE %s to %s;", homeDBDataQuoted, userQuoted)
	dataRootDBSession.Debug().Exec(sql)

	sql = fmt.Sprintf("ALTER DATABASE %s OWNER TO %s;", homeDBConfigQuoted, userQuoted)
	dataRootDBSession.Debug().Exec(sql)

	sql = fmt.Sprintf("ALTER DATABASE %s OWNER TO %s;", homeDBDataQuoted, userQuoted)
	dataRootDBSession.Debug().Exec(sql)

	sql = "SELECT schemaname, tablename, tableowner FROM pg_catalog.pg_tables WHERE schemaname != 'pg_catalog' " +
		"AND schemaname != 'information_schema' AND tableowner != " + pq.QuoteLiteral(*user) + " AND tablename LIKE 'hep_proto%'"

	var Schemaname, Tablename, Tableowner string
	rows, _ := dataHomeDBSession.Debug().Raw(sql).Rows() // (*sql.Rows, error)
	defer rows.Close()

	for rows.Next() {
		err := rows.Scan(&Schemaname, &Tablename, &Tableowner)
		if err == nil {
			fmt.Println(fmt.Sprintf("changing owner of [%s].[%s] from [%s] to [%s]", Schemaname, Tablename, Tableowner, *user))
			sql = fmt.Sprintf("GRANT ALL ON TABLE %s.%s TO %s;", pq.QuoteIdentifier(Schemaname), pq.QuoteIdentifier(Tablename), userQuoted)
			dataHomeDBSession.Debug().Exec(sql)
		} else {
			logger.Error(fmt.Sprintf("Some error during pg_catalog.pg_tables query: %s]: \n", err))
		}
	}

	heputils.Colorize(heputils.ColorYellow, "\r\nDONE")
}

func RevokeHomerRole(dataRootDBSession *gorm.DB, user *string, homerDBconfig *string, homerDBdata *string) {

	createString := fmt.Sprintf("\r\nHOMER - revoke role for user [user=%s dbconfig=%s, dbdata=%s]", *user, *homerDBconfig, *homerDBdata)

	heputils.Colorize(heputils.ColorRed, createString)

	userQuoted := pq.QuoteIdentifier(*user)
	homeDBConfigQuoted := pq.QuoteIdentifier(*homerDBconfig)
	homeDBDataQuoted := pq.QuoteIdentifier(*homerDBdata)

	sql := fmt.Sprintf("REVOKE ALL PRIVILEGES ON DATABASE %s FROM %s;", homeDBConfigQuoted, userQuoted)
	dataRootDBSession.Debug().Exec(sql)

	sql = fmt.Sprintf("REVOKE ALL PRIVILEGES ON DATABASE %s FROM %s;", homeDBDataQuoted, userQuoted)
	dataRootDBSession.Debug().Exec(sql)

	sql = fmt.Sprintf("ALTER DATABASE %s OWNER TO postgres;", homeDBConfigQuoted)
	dataRootDBSession.Debug().Exec(sql)

	sql = fmt.Sprintf("ALTER DATABASE %s OWNER TO postgres;", homeDBDataQuoted)
	dataRootDBSession.Debug().Exec(sql)

	heputils.Colorize(heputils.ColorYellow, "\r\nDONE")
}

func ShowUsers(dataRootDBSession *gorm.DB) {

	createString := fmt.Sprintf("\r\nHOMER - show users")

	heputils.Colorize(heputils.ColorRed, createString)

	sql2 := "SELECT u.usename AS \"Username\", CASE WHEN u.usesuper AND u.usecreatedb THEN CAST('superuser, create database' AS pg_catalog.text)" +
		"WHEN u.usesuper THEN CAST('superuser' AS pg_catalog.text) WHEN u.usecreatedb THEN CAST('create database' AS  pg_catalog.text)" +
		"ELSE CAST('' AS pg_catalog.text) END AS \"Attributes\" FROM pg_catalog.pg_user u ORDER BY 1;"

	fmt.Println("\tRole name\t|\tAttributes")
	fmt.Println("------------------------------------------------")

	var Username, Attributes string
	rows, _ := dataRootDBSession.Raw(sql2).Rows() // (*sql.Rows, error)
	defer rows.Close()
	for rows.Next() {
		err := rows.Scan(&Username, &Attributes)
		if err == nil {
			fmt.Println(fmt.Sprintf("\t%s\t|\t%s\t", Username, Attributes))
		}

	}
	heputils.Colorize(heputils.ColorYellow, "\r\nDONE")
}

func CheckVersion(dataRootDBSession *gorm.DB) (int, error) {

	sql2 := "SHOW server_version_num;"

	var VersionNum int
	rows, _ := dataRootDBSession.Raw(sql2).Rows() // (*sql.Rows, error)
	defer rows.Close()
	if rows.Next() {
		err := rows.Scan(&VersionNum)
		if err != nil {
			return 0, err
		}
	}
	return VersionNum, nil
}

func CreateHomerConfigTables(configDBSession *gorm.DB, homerDBconfig string, typeAction bool, showUpgrade bool) {

	if showUpgrade {
		actionString := "creating"
		if typeAction {
			actionString = "upgrading"
		}
		createString := fmt.Sprintf("\r\nHOMER - %s tables for the config DB [dbname=%s]", actionString, homerDBconfig)
		heputils.Colorize(heputils.ColorGreen, createString)
	}

	db := configDBSession.AutoMigrate(&model.TableAlias{},
		&model.TableGlobalSettings{},
		&model.TableMappingSchema{},
		&model.TableUserSettings{},
		&model.TableHepsubSchema{},
		&model.TableUser{},
		&model.TableAgentLocationSession{},
		&model.TableVersions{},
		&model.TableApplications{},
		&model.TableAuthToken{})
	if db != nil && db.Error != nil {
		logger.Error(fmt.Sprintf("Automigrate failed: with error %s", db.Error))
	} else {
		logger.Debug("Automigrate was success")
	}

	if showUpgrade {
		heputils.Colorize(heputils.ColorYellow, "\r\nDONE")
	}
}

func checkHomerConfigTables(configDBSession *gorm.DB) map[string]bool {

	data := []model.TableVersions{}
	createTables := map[string]bool{}
	if err := configDBSession.Debug().
		Table("versions").
		Find(&data).Error; err != nil {
		return createTables
	}

	for _, row := range data {
		createTables[row.NameTable] = false
		if jsonschema.TableVersion[row.NameTable] < row.VersionTable {
			fmt.Println("Found older version:", row.NameTable)
			createTables[row.NameTable] = true
		}
	}

	return createTables
}

func PopulateHomerConfigTables(configDBSession *gorm.DB, homerDBconfig string, force bool, tablesPopulate []string, password string) {

	if password != "" {
		jsonschema.DefaultAdminPassword = password
		jsonschema.DefaultSupportPassword = password
	}

	hashedAdminPassword, _ := bcrypt.GenerateFromPassword([]byte(jsonschema.DefaultAdminPassword), bcrypt.DefaultCost)
	hashedSupportPassword, _ := bcrypt.GenerateFromPassword([]byte(jsonschema.DefaultSupportPassword), bcrypt.DefaultCost)

	createString := fmt.Sprintf("\r\nHOMER - filling tables for the config DB [dbname=%s]", homerDBconfig)
	usersData := []model.TableUser{
		model.TableUser{
			UserName:   "admin",
			PartId:     10,
			Email:      "root@localhost",
			FirstName:  "Homer",
			LastName:   "Admin",
			Department: "Develop",
			UserGroup:  "admin",
			Hash:       string(hashedAdminPassword),
			GUID:       heputils.GenereateNewUUID(),
		},
		model.TableUser{
			UserName:   "support",
			PartId:     10,
			Email:      "support@localhost",
			FirstName:  "Homer",
			LastName:   "Support",
			Department: "Develop",
			UserGroup:  "admin",
			Hash:       string(hashedSupportPassword),
			GUID:       heputils.GenereateNewUUID(),
		},
	}

	authTokens := []model.TableAuthToken{
		model.TableAuthToken{
			ID:            1,
			GUID:          heputils.GenereateNewUUID(),
			Name:          "Test token",
			UserGUID:      heputils.GenereateNewUUID(),
			Token:         heputils.GenerateToken(),
			UserObject:    jsonschema.AgentObjectforAuthToken,
			IPAddress:     "0.0.0.0/0",
			LastUsageDate: time.Now(),
			CreateDate:    time.Now(),
			ExpireDate:    time.Now().Add(720 * time.Hour),
			UsageCalls:    0,
			LimitCalls:    1000,
			Active:        &[]bool{true}[0],
		},
	}

	globalSettingData := []model.TableGlobalSettings{
		model.TableGlobalSettings{
			GUID:     heputils.GenereateNewUUID(),
			PartId:   1,
			Category: "search",
			Param:    "lokiserver",
			Data:     jsonschema.LokiConfig,
		},
		model.TableGlobalSettings{
			GUID:     heputils.GenereateNewUUID(),
			PartId:   1,
			Category: "search",
			Param:    "promserver",
			Data:     jsonschema.PrometheusConfig,
		},
		model.TableGlobalSettings{
			GUID:     heputils.GenereateNewUUID(),
			PartId:   1,
			Category: "search",
			Param:    "grafana",
			Data:     jsonschema.GrafanaConfig,
		},
		model.TableGlobalSettings{
			GUID:     heputils.GenereateNewUUID(),
			PartId:   1,
			Category: "export",
			Param:    "transaction",
			Data:     jsonschema.ExportConfig,
		},
		model.TableGlobalSettings{
			GUID:     heputils.GenereateNewUUID(),
			PartId:   1,
			Category: "search",
			Param:    "transaction",
			Data:     jsonschema.TransactionConfig,
		},
	}

	agentLocationSession := []model.TableAgentLocationSession{
		model.TableAgentLocationSession{
			GUID:       heputils.GenereateNewUUID(),
			Gid:        10,
			Host:       "127.0.0.1",
			Port:       8080,
			Protocol:   "rtp",
			Path:       "/api/search",
			Node:       "rtpnode01",
			Type:       "cdr",
			CreateDate: time.Now(),
			ExpireDate: time.Now(),
			Active:     1,
		},
	}

	hepsubSchema := []model.TableHepsubSchema{
		model.TableHepsubSchema{
			GUID:       heputils.GenereateNewUUID(),
			Profile:    "default",
			Hepid:      1,
			HepAlias:   "SIP",
			Version:    1,
			Mapping:    jsonschema.CorrelationMappingdefault,
			CreateDate: time.Now(),
		},
		model.TableHepsubSchema{
			GUID:       heputils.GenereateNewUUID(),
			Profile:    "call",
			Hepid:      1,
			HepAlias:   "SIP",
			Version:    1,
			Mapping:    jsonschema.CorrelationMappingdefault,
			CreateDate: time.Now(),
		},
		model.TableHepsubSchema{
			GUID:       heputils.GenereateNewUUID(),
			Profile:    "registration",
			Hepid:      1,
			HepAlias:   "SIP",
			Version:    1,
			Mapping:    jsonschema.CorrelationMappingdefault,
			CreateDate: time.Now(),
		},
	}

	dashboardUsers := []model.TableUserSettings{
		model.TableUserSettings{
			GUID:       heputils.GenereateNewUUID(),
			UserName:   "admin",
			Param:      "home",
			PartId:     10,
			Category:   "dashboard",
			Data:       jsonschema.DashboardHome,
			CreateDate: time.Now(),
		},
		model.TableUserSettings{
			GUID:       heputils.GenereateNewUUID(),
			UserName:   "admin",
			Param:      "registration",
			PartId:     10,
			Category:   "dashboard",
			Data:       jsonschema.DashboardRegister,
			CreateDate: time.Now(),
		},
		model.TableUserSettings{
			GUID:       heputils.GenereateNewUUID(),
			UserName:   "admin",
			Param:      "smartsearch",
			PartId:     10,
			Category:   "dashboard",
			Data:       jsonschema.DashboardSmartSearch,
			CreateDate: time.Now(),
		},
		model.TableUserSettings{
			GUID:       heputils.GenereateNewUUID(),
			UserName:   "support",
			Param:      "home",
			PartId:     10,
			Category:   "dashboard",
			Data:       jsonschema.DashboardHome,
			CreateDate: time.Now(),
		},
		model.TableUserSettings{
			GUID:       heputils.GenereateNewUUID(),
			UserName:   "support",
			Param:      "smartsearch",
			PartId:     10,
			Category:   "dashboard",
			Data:       jsonschema.DashboardSmartSearch,
			CreateDate: time.Now(),
		},
	}

	tableVersions := []model.TableVersions{}

	mappingSchema := []model.TableMappingSchema{
		model.TableMappingSchema{
			GUID:               heputils.GenereateNewUUID(),
			Profile:            "default",
			Hepid:              1,
			HepAlias:           "SIP",
			PartID:             10,
			Version:            1,
			Retention:          10,
			PartitionStep:      10,
			CreateIndex:        jsonschema.EmptyJson,
			CreateTable:        "CREATE TABLE test(id integer, data text);",
			FieldsMapping:      jsonschema.FieldsMapping1default,
			CorrelationMapping: jsonschema.CorrelationMapping1default,
			MappingSettings:    jsonschema.EmptyJson,
			SchemaMapping:      jsonschema.EmptyJson,
			SchemaSettings:     jsonschema.EmptyJson,
			CreateDate:         time.Now(),
		},
		model.TableMappingSchema{
			GUID:               heputils.GenereateNewUUID(),
			Profile:            "call",
			Hepid:              1,
			HepAlias:           "SIP",
			PartID:             10,
			Version:            1,
			Retention:          10,
			PartitionStep:      10,
			CreateIndex:        jsonschema.EmptyJson,
			CreateTable:        "CREATE TABLE test(id integer, data text);",
			FieldsMapping:      jsonschema.FieldsMapping1call,
			CorrelationMapping: jsonschema.CorrelationMapping1call,
			MappingSettings:    jsonschema.EmptyJson,
			SchemaMapping:      jsonschema.EmptyJson,
			SchemaSettings:     jsonschema.EmptyJson,
			CreateDate:         time.Now(),
		},
		model.TableMappingSchema{
			GUID:               heputils.GenereateNewUUID(),
			Profile:            "registration",
			Hepid:              1,
			HepAlias:           "SIP",
			PartID:             10,
			Version:            1,
			Retention:          10,
			PartitionStep:      10,
			CreateIndex:        jsonschema.EmptyJson,
			CreateTable:        "CREATE TABLE test(id integer, data text);",
			FieldsMapping:      jsonschema.FieldsMapping1default,
			CorrelationMapping: jsonschema.CorrelationMapping1registration,
			MappingSettings:    jsonschema.EmptyJson,
			SchemaMapping:      jsonschema.EmptyJson,
			SchemaSettings:     jsonschema.EmptyJson,
			CreateDate:         time.Now(),
		},
		model.TableMappingSchema{
			GUID:               heputils.GenereateNewUUID(),
			Profile:            "default",
			Hepid:              100,
			HepAlias:           "LOG",
			PartID:             10,
			Version:            1,
			Retention:          10,
			PartitionStep:      10,
			CreateIndex:        jsonschema.EmptyJson,
			CreateTable:        "CREATE TABLE test(id integer, data text);",
			FieldsMapping:      jsonschema.FieldsMapping100default,
			CorrelationMapping: jsonschema.CorrelationMapping100default,
			MappingSettings:    jsonschema.EmptyJson,
			SchemaMapping:      jsonschema.EmptyJson,
			SchemaSettings:     jsonschema.EmptyJson,
			CreateDate:         time.Now(),
		},
		model.TableMappingSchema{
			GUID:               heputils.GenereateNewUUID(),
			Profile:            "default",
			Hepid:              2000,
			HepAlias:           "LOKI",
			PartID:             10,
			Version:            1,
			Retention:          10,
			PartitionStep:      10,
			CreateIndex:        jsonschema.EmptyJson,
			CreateTable:        "CREATE TABLE test(id integer, data text);",
			CorrelationMapping: jsonschema.EmptyJson,
			FieldsMapping:      jsonschema.FieldsMapping2000loki,
			MappingSettings:    jsonschema.EmptyJson,
			SchemaMapping:      jsonschema.EmptyJson,
			SchemaSettings:     jsonschema.EmptyJson,
			CreateDate:         time.Now(),
		},
	}

	createTables := checkHomerConfigTables(configDBSession)

	/*********************************************/
	heputils.Colorize(heputils.ColorRed, createString)

	//tablesPopulate
	var forceIt = force
	var lenTable = len(tablesPopulate)
	tableName := "users"

	if !heputils.ElementExists(tablesPopulate, tableName) {
		forceIt = false
	}

	if val, ok := createTables[tableName]; !ok || ok && val || forceIt {
		/* User data */
		if lenTable == 0 || heputils.YesNo(tableName) {

			heputils.Colorize(heputils.ColorRed, "reinstalling "+tableName)
			configDBSession.Exec("TRUNCATE TABLE " + tableName)
			for _, el := range usersData {
				db := configDBSession.Save(&el)
				if db != nil && db.Error != nil {
					logger.Error(fmt.Sprintf("Save failed for table [%s]: with error %s. User: [%s]", tableName, db.Error, el.UserName))
				} else {
					logger.Debug(fmt.Sprintf("Save for table [%s] was success. User: [%s]", tableName, el.UserName))
				}
			}
			tableVersions = append(tableVersions, model.TableVersions{
				NameTable:    tableName,
				VersionTable: jsonschema.TableVersion[tableName],
			})
		}
	}

	forceIt = force
	tableName = "global_settings"

	if !heputils.ElementExists(tablesPopulate, tableName) {
		forceIt = false
	}

	if val, ok := createTables[tableName]; !ok || ok && val || forceIt {

		/* globalSettingData data */
		if lenTable == 0 || heputils.YesNo(tableName) {

			heputils.Colorize(heputils.ColorRed, "reinstalling "+tableName)
			configDBSession.Exec("TRUNCATE TABLE " + tableName)
			for _, el := range globalSettingData {
				db := configDBSession.Save(&el)
				if db != nil && db.Error != nil {
					logger.Error(fmt.Sprintf("Save failed for table [%s]: with error %s. Param: [%s]", tableName, db.Error, el.Param))
				} else {
					logger.Debug(fmt.Sprintf("Save for table [%s] was success. Param: [%s] ", tableName, el.Param))
				}
			}

			tableVersions = append(tableVersions, model.TableVersions{
				NameTable:    tableName,
				VersionTable: jsonschema.TableVersion[tableName],
			})
		}
	}

	forceIt = force
	tableName = "auth_token"

	if !heputils.ElementExists(tablesPopulate, tableName) {
		forceIt = false
	}

	if val, ok := createTables[tableName]; !ok || ok && val || forceIt {

		/* authTokens data */
		if lenTable == 0 || heputils.YesNo(tableName) {

			heputils.Colorize(heputils.ColorRed, "reinstalling "+tableName)
			configDBSession.Exec("TRUNCATE TABLE " + tableName)
			for _, el := range authTokens {
				db := configDBSession.Save(&el)
				if db != nil && db.Error != nil {
					logger.Error(fmt.Sprintf("Save failed for table [%s]: with error %s. Token: [%s]", tableName, db.Error, el.Token))
				} else {
					logger.Debug(fmt.Sprintf("Save for table [%s] was success. Token: [%s]", tableName, el.Token))
				}
			}

			tableVersions = append(tableVersions, model.TableVersions{
				NameTable:    tableName,
				VersionTable: jsonschema.TableVersion[tableName],
			})
		}
	}

	tableName = "agent_location_session"
	forceIt = force
	if !heputils.ElementExists(tablesPopulate, tableName) {
		forceIt = false
	}

	if val, ok := createTables[tableName]; !ok || ok && val || forceIt {
		/* agentLocationSession data */
		if lenTable == 0 || heputils.YesNo(tableName) {
			heputils.Colorize(heputils.ColorRed, "reinstalling "+tableName)
			configDBSession.Exec("TRUNCATE TABLE " + tableName)
			for _, el := range agentLocationSession {
				db := configDBSession.Save(&el)
				if db != nil && db.Error != nil {
					logger.Error(fmt.Sprintf("Save failed for table [%s]: with error %s. Host:[%s]", tableName, db.Error, el.Host))
				} else {
					logger.Debug(fmt.Sprintf("Save for table [%s] was success. Host:[%s]", tableName, el.Host))
				}
			}
			tableVersions = append(tableVersions, model.TableVersions{
				NameTable:    tableName,
				VersionTable: jsonschema.TableVersion[tableName],
			})
		}
	}

	forceIt = force
	tableName = "hepsub_mapping_schema"

	if !heputils.ElementExists(tablesPopulate, tableName) {
		forceIt = false
	}

	if val, ok := createTables[tableName]; !ok || ok && val || forceIt {
		/* hepsubSchema data */
		if lenTable == 0 || heputils.YesNo(tableName) {
			heputils.Colorize(heputils.ColorRed, "reinstalling "+tableName)
			configDBSession.Exec("TRUNCATE TABLE " + tableName)
			for _, el := range hepsubSchema {
				db := configDBSession.Save(&el)
				if db != nil && db.Error != nil {
					logger.Error(fmt.Sprintf("Save failed for table [%s]: with error %s. Hepid:[%d] Profile:[%s]", tableName, db.Error, el.Hepid, el.Profile))
				} else {
					logger.Debug(fmt.Sprintf("Save for table [%s] was success. Hepid:[%d] Profile:[%s]", tableName, el.Hepid, el.Profile))
				}
			}

			tableVersions = append(tableVersions, model.TableVersions{
				NameTable:    tableName,
				VersionTable: jsonschema.TableVersion[tableName],
			})
		}
	}

	forceIt = force
	tableName = "user_settings"

	if !heputils.ElementExists(tablesPopulate, tableName) {
		forceIt = false
	}

	if val, ok := createTables[tableName]; !ok || ok && val || forceIt {

		/* dashboardUsers data */
		if lenTable == 0 || heputils.YesNo(tableName) {
			heputils.Colorize(heputils.ColorRed, "reinstalling "+tableName)
			configDBSession.Exec("TRUNCATE TABLE " + tableName)
			for _, el := range dashboardUsers {
				db := configDBSession.Save(&el)
				if db != nil && db.Error != nil {
					logger.Error(fmt.Sprintf("Save failed for table [%s]: with error %s. Category: [%s], Param: [%s]", tableName, db.Error, el.Category, el.Param))
				} else {
					logger.Debug(fmt.Sprintf("Save for table [%s] was success. Category: [%s], Param: [%s]", tableName, el.Category, el.Param))
				}
			}

			tableVersions = append(tableVersions, model.TableVersions{
				NameTable:    tableName,
				VersionTable: jsonschema.TableVersion[tableName],
			})
		}
	}

	forceIt = force
	tableName = "mapping_schema"

	if !heputils.ElementExists(tablesPopulate, tableName) {
		forceIt = false
	}

	if val, ok := createTables[tableName]; !ok || ok && val || forceIt {
		/* mappingSchema data */
		if lenTable == 0 || heputils.YesNo(tableName) {

			heputils.Colorize(heputils.ColorRed, "reinstalling "+tableName)
			configDBSession.Exec("TRUNCATE TABLE " + tableName)
			for _, el := range mappingSchema {
				db := configDBSession.Save(&el)
				if db != nil && db.Error != nil {
					logger.Error(fmt.Sprintf("Save failed for table [%s]: with error %s. HEPID:[%d], Profile:[%s]", tableName, db.Error, el.Hepid, el.Profile))
				} else {
					logger.Debug(fmt.Sprintf("Save for table [%s] was success. HEPID:[%d], Profile:[%s]", tableName, el.Hepid, el.Profile))
				}
			}

			tableVersions = append(tableVersions, model.TableVersions{
				NameTable:    tableName,
				VersionTable: jsonschema.TableVersion[tableName],
			})
		}
	}

	tableName = "versions"

	if len(tableVersions) > 0 {

		tableVersions = append(tableVersions, model.TableVersions{
			NameTable:    tableName,
			VersionTable: jsonschema.TableVersion[tableName],
		})

		/* tableVersions data */
		heputils.Colorize(heputils.ColorRed, "reinstalling "+tableName)
		//configDBSession.Exec("TRUNCATE TABLE versions")
		for _, el := range tableVersions {
			sql := fmt.Sprintf("DELETE FROM versions WHERE table_name = %s", pq.QuoteIdentifier(el.NameTable))
			db := configDBSession.Exec(sql)
			if db != nil && db.Error != nil {
				logger.Error(fmt.Sprintf("Exec delete failed for table [%s]: with error %s", tableName, db.Error))
			} else {
				logger.Debug("Delete all records for table [" + tableName + "] was success")
			}

			db = configDBSession.Save(&el)
			if db != nil && db.Error != nil {
				logger.Error(fmt.Sprintf("Save failed for table [%s]: with error %s. Table:[%s], Version:[%d]", tableName, db.Error, el.NameTable, el.VersionTable))
			} else {
				logger.Debug(fmt.Sprintf("Save for table [%s] was success. Table:[%s], Version:[%d]", tableName, el.NameTable, el.VersionTable))
			}
		}
	}

	heputils.Colorize(heputils.ColorYellow, "\r\nDONE")
}

func UpdateHomerUser(configDBSession *gorm.DB, homerDBconfig string, userName string, userPassword string) error {

	createString := fmt.Sprintf("\r\nHOMER - updating user [dbname=%s]", homerDBconfig)

	user := model.TableUser{}
	if err := configDBSession.Debug().Table("users").Where("username = ? ", userName).Find(&user).Error; err != nil {
		logger.Error("Coudn't find user [", userName, "]: with error:", err)
		return err
	}

	/*********************************************/
	heputils.Colorize(heputils.ColorRed, createString)

	// get new instance of user data source
	user.CreatedAt = time.Now()
	password := []byte(userPassword)
	hashedPassword, err := bcrypt.GenerateFromPassword(password, bcrypt.DefaultCost)
	if err != nil {
		logger.Error(fmt.Sprintf("Save failed for table [%s]: with error %s. User: [%s]", "users", configDBSession.Error, userName))
		return err
	}
	user.Hash = string(hashedPassword)

	err = configDBSession.Debug().Table("users").Model(&model.TableUser{}).Where("username =  ?", userName).Update(&user).Error
	if err != nil {
		logger.Error(fmt.Sprintf("Coudn't update user [%s]: with error %s.", userName, configDBSession.Error))
		return err
	}

	heputils.Colorize(heputils.ColorYellow, "\r\nDONE")

	return nil
}

func GetMappingSchemas() []model.TableMappingSchema {

	mappingSchema := []model.TableMappingSchema{
		model.TableMappingSchema{
			GUID:               heputils.GenereateNewUUID(),
			Profile:            "default",
			Hepid:              1,
			HepAlias:           "SIP",
			PartID:             10,
			Version:            1,
			Retention:          10,
			PartitionStep:      10,
			CreateIndex:        jsonschema.EmptyJson,
			CreateTable:        "CREATE TABLE test(id integer, data text);",
			FieldsMapping:      jsonschema.FieldsMapping1default,
			CorrelationMapping: jsonschema.CorrelationMapping1default,
			MappingSettings:    jsonschema.EmptyJson,
			SchemaMapping:      jsonschema.EmptyJson,
			SchemaSettings:     jsonschema.EmptyJson,
			CreateDate:         time.Now(),
		},
		model.TableMappingSchema{
			GUID:               heputils.GenereateNewUUID(),
			Profile:            "call",
			Hepid:              1,
			HepAlias:           "SIP",
			PartID:             10,
			Version:            1,
			Retention:          10,
			PartitionStep:      10,
			CreateIndex:        jsonschema.EmptyJson,
			CreateTable:        "CREATE TABLE test(id integer, data text);",
			FieldsMapping:      jsonschema.FieldsMapping1call,
			CorrelationMapping: jsonschema.CorrelationMapping1call,
			MappingSettings:    jsonschema.EmptyJson,
			SchemaMapping:      jsonschema.EmptyJson,
			SchemaSettings:     jsonschema.EmptyJson,
			CreateDate:         time.Now(),
		},
		model.TableMappingSchema{
			GUID:               heputils.GenereateNewUUID(),
			Profile:            "registration",
			Hepid:              1,
			HepAlias:           "SIP",
			PartID:             10,
			Version:            1,
			Retention:          10,
			PartitionStep:      10,
			CreateIndex:        jsonschema.EmptyJson,
			CreateTable:        "CREATE TABLE test(id integer, data text);",
			FieldsMapping:      jsonschema.FieldsMapping1default,
			CorrelationMapping: jsonschema.CorrelationMapping1registration,
			MappingSettings:    jsonschema.EmptyJson,
			SchemaMapping:      jsonschema.EmptyJson,
			SchemaSettings:     jsonschema.EmptyJson,
			CreateDate:         time.Now(),
		},
		model.TableMappingSchema{
			GUID:               heputils.GenereateNewUUID(),
			Profile:            "default",
			Hepid:              100,
			HepAlias:           "LOG",
			PartID:             10,
			Version:            1,
			Retention:          10,
			PartitionStep:      10,
			CreateIndex:        jsonschema.EmptyJson,
			CreateTable:        "CREATE TABLE test(id integer, data text);",
			FieldsMapping:      jsonschema.FieldsMapping100default,
			CorrelationMapping: jsonschema.CorrelationMapping100default,
			MappingSettings:    jsonschema.EmptyJson,
			SchemaMapping:      jsonschema.EmptyJson,
			SchemaSettings:     jsonschema.EmptyJson,
			CreateDate:         time.Now(),
		},
		model.TableMappingSchema{
			GUID:               heputils.GenereateNewUUID(),
			Profile:            "default",
			Hepid:              2000,
			HepAlias:           "LOKI",
			PartID:             10,
			Version:            1,
			Retention:          10,
			PartitionStep:      10,
			CreateIndex:        jsonschema.EmptyJson,
			CreateTable:        "CREATE TABLE test(id integer, data text);",
			CorrelationMapping: jsonschema.EmptyJson,
			FieldsMapping:      jsonschema.FieldsMapping2000loki,
			MappingSettings:    jsonschema.EmptyJson,
			SchemaMapping:      jsonschema.EmptyJson,
			SchemaSettings:     jsonschema.EmptyJson,
			CreateDate:         time.Now(),
		},
	}

	return mappingSchema

}
