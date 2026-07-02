package service

import (
	"fmt"
	"regexp"
	"strings"

	client "github.com/influxdata/influxdb1-client/v2"
)

var (
	safeInfluxIdentifier  = regexp.MustCompile(`^[a-zA-Z_][a-zA-Z0-9_]*$`)
	safeInfluxMeasurement = regexp.MustCompile(`^[a-zA-Z0-9_.:/-]+$`)
)

func validateInfluxDatabase(name string) error {
	if !safeInfluxIdentifier.MatchString(name) {
		return fmt.Errorf("invalid influx database name: %q", name)
	}
	return nil
}

func validateInfluxRetention(name string) error {
	if name == "" || name == "none" {
		return nil
	}
	if !safeInfluxIdentifier.MatchString(name) {
		return fmt.Errorf("invalid influx retention policy: %q", name)
	}
	return nil
}

func validateInfluxRetentionRef(name string) error {
	if name == "" || name == "none" {
		return fmt.Errorf("invalid influx retention policy: %q", name)
	}
	return validateInfluxRetention(name)
}

func validateInfluxMeasurement(name string) error {
	if name == "" {
		return fmt.Errorf("invalid influx measurement name: empty")
	}
	if strings.ContainsAny(name, "\"\\\n\r;") {
		return fmt.Errorf("invalid influx measurement name: %q", name)
	}
	if !safeInfluxMeasurement.MatchString(name) {
		return fmt.Errorf("invalid influx measurement name: %q", name)
	}
	return nil
}

func validateInfluxFieldKey(name string) error {
	if !safeInfluxIdentifier.MatchString(name) {
		return fmt.Errorf("invalid influx field key: %q", name)
	}
	return nil
}

func validateStatisticQueryEntry(database, retention, main string, fieldKeys []string) error {
	if err := validateInfluxDatabase(database); err != nil {
		return err
	}
	if err := validateInfluxRetention(retention); err != nil {
		return err
	}
	if err := validateInfluxMeasurement(main); err != nil {
		return err
	}
	for _, key := range fieldKeys {
		if err := validateInfluxFieldKey(key); err != nil {
			return err
		}
	}
	return nil
}

func influxIdentifierParam(name string, validate func(string) error) (client.Identifier, error) {
	if err := validate(name); err != nil {
		return "", err
	}
	return client.Identifier(name), nil
}

func buildMeanSelectClause(fieldKeys []string) (string, client.Params, error) {
	params := client.Params{}
	parts := make([]string, 0, len(fieldKeys))

	for i, fieldKey := range fieldKeys {
		if err := validateInfluxFieldKey(fieldKey); err != nil {
			return "", nil, err
		}

		fieldParam := fmt.Sprintf("field%d", i)
		aliasParam := fmt.Sprintf("alias%d", i)
		id, err := influxIdentifierParam(fieldKey, validateInfluxFieldKey)
		if err != nil {
			return "", nil, err
		}

		parts = append(parts, fmt.Sprintf("mean($%s) AS $%s", fieldParam, aliasParam))
		params[fieldParam] = id
		params[aliasParam] = id
	}

	return strings.Join(parts, ","), params, nil
}

func statisticSourceClause(retention string) (string, error) {
	if retention == "" || retention == "none" {
		return "$db.$m", nil
	}
	if err := validateInfluxRetentionRef(retention); err != nil {
		return "", err
	}
	return "$db.$rp.$m", nil
}

func buildStatisticDataQuery(database, retention, main string, fieldKeys []string, fromNS, toNS, limit int64, groupInterval string) (client.Query, error) {
	if err := validateStatisticQueryEntry(database, retention, main, fieldKeys); err != nil {
		return client.Query{}, err
	}

	selectClause, fieldParams, err := buildMeanSelectClause(fieldKeys)
	if err != nil {
		return client.Query{}, err
	}

	sourceClause, err := statisticSourceClause(retention)
	if err != nil {
		return client.Query{}, err
	}

	dbID, err := influxIdentifierParam(database, validateInfluxDatabase)
	if err != nil {
		return client.Query{}, err
	}
	measurementID, err := influxIdentifierParam(main, validateInfluxMeasurement)
	if err != nil {
		return client.Query{}, err
	}

	params := client.Params{
		"from_ts": client.IntegerValue(fromNS),
		"to_ts":   client.IntegerValue(toNS),
		"limit":   client.IntegerValue(limit),
		"db":      dbID,
		"m":       measurementID,
	}
	for key, value := range fieldParams {
		params[key] = value
	}

	command := fmt.Sprintf(
		"SELECT %s FROM %s WHERE time > $from_ts AND $to_ts > time GROUP BY time(%s) FILL(null) ORDER BY time DESC LIMIT $limit;",
		selectClause, sourceClause, groupInterval,
	)

	if retention != "" && retention != "none" {
		rpID, err := influxIdentifierParam(retention, validateInfluxRetentionRef)
		if err != nil {
			return client.Query{}, err
		}
		params["rp"] = rpID
	}

	return client.NewQueryWithParameters(command, "", "", params), nil
}

func buildShowRetentionPoliciesQuery(database string) (client.Query, error) {
	dbID, err := influxIdentifierParam(database, validateInfluxDatabase)
	if err != nil {
		return client.Query{}, err
	}

	return client.NewQueryWithParameters(
		"SHOW RETENTION POLICIES ON $db",
		database,
		"",
		client.Params{"db": dbID},
	), nil
}

func buildShowMeasurementsQuery(database string) (client.Query, error) {
	dbID, err := influxIdentifierParam(database, validateInfluxDatabase)
	if err != nil {
		return client.Query{}, err
	}

	return client.NewQueryWithParameters(
		"SHOW MEASUREMENTS ON $db",
		database,
		"",
		client.Params{"db": dbID},
	), nil
}

func buildShowFieldKeysQuery(database, retention, main string) (client.Query, error) {
	if err := validateInfluxDatabase(database); err != nil {
		return client.Query{}, err
	}
	if err := validateInfluxMeasurement(main); err != nil {
		return client.Query{}, err
	}

	measurementID, err := influxIdentifierParam(main, validateInfluxMeasurement)
	if err != nil {
		return client.Query{}, err
	}

	params := client.Params{"m": measurementID}
	var command string

	if retention == "" || retention == "none" {
		command = "SHOW FIELD KEYS FROM $m"
	} else {
		rpID, err := influxIdentifierParam(retention, validateInfluxRetentionRef)
		if err != nil {
			return client.Query{}, err
		}
		params["rp"] = rpID
		command = "SHOW FIELD KEYS FROM $rp.$m"
	}

	return client.NewQueryWithParameters(command, database, "s", params), nil
}

func buildShowTagKeysQuery(database, retention, main string) (client.Query, error) {
	if err := validateInfluxDatabase(database); err != nil {
		return client.Query{}, err
	}
	if err := validateInfluxMeasurement(main); err != nil {
		return client.Query{}, err
	}

	measurementID, err := influxIdentifierParam(main, validateInfluxMeasurement)
	if err != nil {
		return client.Query{}, err
	}

	params := client.Params{"m": measurementID}
	var command string

	if retention == "" || retention == "none" {
		command = "SHOW TAG KEYS FROM $m"
	} else {
		rpID, err := influxIdentifierParam(retention, validateInfluxRetentionRef)
		if err != nil {
			return client.Query{}, err
		}
		params["rp"] = rpID
		command = "SHOW TAG KEYS FROM $rp.$m"
	}

	return client.NewQueryWithParameters(command, database, "s", params), nil
}
