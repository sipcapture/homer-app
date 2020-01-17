# HOMER-APP Configuration

The `homer-app` configuration includes a number of blocks allowing it to communicate with its connected elements.

### Database Data
The data connections allow `homer-app` to communicate with one or more db nodes to fetch data results.
The `database_data` element can contain one or more objects reflecting each unique node:

##### Single Node
```
  "database_data": {
    "LocalNode": {
      "help": "Settings for PGSQL Database (data)",
      "node": "LocalNode",
      "user": "homer_user",
      "pass": "homer_password",
      "name": "homer_data",
      "host": "127.0.0.1"
    }
  }
```
##### Multi Node
```
  "database_data": {
    "LocalNode": {
      "help": "Settings for PGSQL Database (data)",
      "node": "LocalNode",
      "user": "homer_user",
      "pass": "homer_password",
      "name": "homer_data",
      "host": "127.0.0.1"
    },
    "RemoteNode": {
      "help": "Settings for PGSQL Database (data)",
      "node": "RemoteNode",
      "user": "homer_user",
      "pass": "homer_password",
      "name": "homer_data",
      "host": "127.0.0.2"
    }
  }
```
### Database Config
The config connection allows `homer-app` to read and write its configuration items to database.<br>
NOTE: the database should be initialized using the dedicated commands.
```  
  "database_config": {
    "help": "Settings for PGSQL Database (settings)",
    "node": "LocalConfig",
    "user": "homer_user",
    "pass": "homer_password",
    "name": "homer_config",
    "host": "localhost"
  }
```
### InfluxDB Config (optional)
When desirable, `homer-app` can be configured to fetch timeseries from InfluxDB. Configure when needed.
```
  
  "influxdb_config": {
    "help": "Settings for InfluxDB Database (optional)",
    "user": "influx_user",
    "pass": "influx_password",
    "name": "homer_config",
    "host": "http:/127.0.0.1:8086" ,
    "database": "homer",
    "policy": "autogen"
  }
```

### Prometheus Config (optional)
When desirable, `homer-app` can be configured to fetch timeseries from Prometheus. Configure when needed.
```
  "prometheus_config": {
    "help": "Settings for Prometheus Database (optional)",
    "user": "admin",
    "pass": "admin",
    "host": "http://127.0.0.1:9090",
    "api": "api/v1"
  }

```
### Loki Config (optional)
When desirable, `homer-app` can be configured to fetch logs from Loki. Configure when needed.
```
  "loki_config": {
    "help": "Settings for LOKI Database (optional)",
    "user": "admin",
    "pass": "admin",
    "host": "http://127.0.0.1:3100",
    "api": "api/prom"
  }  
```

### Server Config (mandatory)
This section defines the parameters used by `homer-app` to serve its API and Frontend. The `root` location refers to the full path where the User-Interface is deployed.
```
  "http_settings": {
    "help": "Settings for the HOMER Webapp Server",
    "host": "0.0.0.0",
    "port" : 9080,
    "root" : "/usr/local/homer/dist",
    "gzip" : true,
    "debug" : false
  }
```

### System Settings
This section defined the path and names used for `homer-app` generated logs. Configure when needed.
Loglevels: fatal, error, warn, info, debug, trace
If the loglevel is >= info , the stdout will be enabled automaticaly.
```
  "system_settings": {
    "help": "Settings for HOMER logs",
    "logpath": "/usr/local/homer/log",
    "logname" : "homer-app.log",
    "loglevel": "error",
    "logstdout": false
  }
```

### Authentication Settings
This section defines how `homer-app` will authenticate its API and UI users. By default, uses internal database.
```  
  "auth_settings": {
    "_comment": "The type param can be internal, ldap",
    "type": "internal"
  },
  "ldap_config": {
    "Base":  "dc=example,dc=com",
		"Host":  "ldap.example.com",
		"Port":   389,
		"UseSSL": false,
		"BindDN": "uid=readonlysuer,ou=People,dc=example,dc=com",
		"BindPassword": "readonlypassword",
		"UserFilter": "(uid=%s)",
		"GroupFilter": "(memberUid=%s)",
		"Attributes": ["givenName", "sn", "mail", "uid"]
  }
}
```

### External Decoder Settings
This section defined an external decoder that give you show message as a Wireshark View
```
  "decoder_shark": {
    "_comment": "Here you can do packet decoding to using tshark application. Please define uid, gid if you run the app under root",
    "active": true,
    "bin": "/usr/bin/tshark",
    "protocols":  ["1_call","1_registration", "1_default"]
  }
```
