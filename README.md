<img src="https://user-images.githubusercontent.com/1423657/55069501-8348c400-5084-11e9-9931-fefe0f9874a7.png" width=200/>

# HOMER WebApp

This repository hosts `homer-app`, the the GO webapplication for the HEP/HOMER 7.7+ stack.

### Instructions

If you're just interested in using `homer-app`, download, configure and run the latest release or package.

#### Requirements
* golang 1.13+
* postgres 11+
* optional
  * prometheus
  * influxdb
  * loki

#### Installation
##### Local
To get dependencies and compile the latest homer-app on your system, use the following commands:
```
make modules
make all
```
##### Docker
To get dependencies and compile the latest homer-app using a docker builder, use the following command:
```
make binary
make frontend
```

### Configuration
Before using the application, configure all database parameters using the example configuration file:
```
/usr/local/homer/etc/webapp_config.json
```

NOTE: The default location for settings and provisioning files is `/usr/local/homer`


#### Usage
##### Command Help
```
./homer-app -h
```
##### Custom Config in `/etc`
```
./homer-app -webapp-config-path=/etc
```

##### Initialization
The application is able to initialize its database and tables it requires with the following commands:
###### Create User
```
./homer-app -create-homer-user -database-root=postgres -database-host=localhost -database-root-password=postgres
```
###### Show User
```
./homer-app -show-db-users -database-root=postgres -database-host=localhost -database-root-password=postgres
```
###### Create Homer DBs
```
./homer-app -create-config-db -database-root=postgres -database-host=localhost -database-root-password=postgres -database-homer-user=homer_user
./homer-app -create-data-db -database-root=postgres -database-host=localhost -database-root-password=postgres -database-homer-user=homer_user
```
###### Create User permissions
```
./homer-app -create-homer-role -database-root=postgres -database-host=localhost -database-root-password=postgres -database-homer-data=homer_data -database-homer-config=homer_config
```

<!--
###### Save it or edit the webapp_config.json manualy
```
./homer-app -save-homer-db-config-settings -database-host=localhost -database-homer-config=homer_config -database-homer-user=homer_user -database-homer-password=homer_password
./homer-app -save-homer-db-data-settings -database-host=localhost -database-homer-data=homer_data -database-homer-user=homer_user -database-homer-password=homer_password
```
-->

###### Create Table / Migration - connection data will be read from `webapp_config.json`
```
./homer-app -create-table-db-config 
```

###### Populate DB
```
./homer-app -populate-table-db-config 
```

###### Upgrade / Migration - connection data will be read from `webapp_config.json`
```
./homer-app -upgrade-table-db-config 
```
###### Re- Populate Config DB 
```
./homer-app -populate-table-db-config -force-populate
```

###### Re- Populate Config DB for specific table/tables 
```
./homer-app -populate-table-db-config -force-populate -populate-table=mapping_schema -populate-table=user_settings
```



------------
<!--
#### Usage ENV
```
WEBAPPENV = config file extension "local" 
WEBAPPPATH - path for config
WEBAPPLOGPATH - path to the log dir
WEBAPPLOGNAME - prefix name of the log
```
-->

### DEB, RPM Packages
To build a full package, including the latest frontend code:
```
make package
```

The application will deploy to `/usr/local/bin` with config in `/etc`


### Docker Image
This application is available on dockerhub as `sipcapture/webapp`
To build a full bundle locally, including the latest frontend code:
```
make docker
```

For working examples and ready to run recipes see [homer7-docker](https://github.com/sipcapture/homer7-docker/tree/7.7/heplify-server)

---

This project is part of HOMER

<img src="https://camo.githubusercontent.com/c287bf83f8d5969635b5bed047a3e70854bc1840/687474703a2f2f736970636170747572652e6f72672f646174612f696d616765732f736970636170747572655f6865616465722e706e67" width=300>

----

#### License & Copyright
This project is released under the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version. 

#### Made by Humans
This Open-Source project is made possible by actual Humans without corporate sponsors, angels or patreons.<br>
If you use this software in production, please consider supporting its development with contributions or [donations](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=donation%40sipcapture%2eorg&lc=US&item_name=SIPCAPTURE&no_note=0&currency_code=EUR&bn=PP%2dDonationsBF%3abtn_donateCC_LG%2egif%3aNonHostedGuest)

[![Donate](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=donation%40sipcapture%2eorg&lc=US&item_name=SIPCAPTURE&no_note=0&currency_code=EUR&bn=PP%2dDonationsBF%3abtn_donateCC_LG%2egif%3aNonHostedGuest) 

###### (C) 2008-2020 QXIP BV

