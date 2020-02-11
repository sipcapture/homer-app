# HOMER-APP 7.7 DEV


### Create Release w/ packages

#### Requirements
* Docker
* Github API Token ($TOKEN)

#### Create Release
```
make binary
make frontend
```
#### Get Release Version
```
RELEASE=$(./homer-app -version | egrep -o '[0-9].[0-9].[0-9]+')
```
#### Build Package artifacts
```
VERSION=$RELEASE make package
```

#### Push to Github
```
PKGNAME="homer-app-$RELEASE-amd64"
./scripts/github-release.sh github_api_token=$TOKEN owner=sipcapture repo=homer-app tag=$RELEASE filename=./homer-app
./scripts/github-release.sh github_api_token=$TOKEN owner=sipcapture repo=homer-app tag=$RELEASE filename=./$PKGNAME.deb
./scripts/github-release.sh github_api_token=$TOKEN owner=sipcapture repo=homer-app tag=$RELEASE filename=./$PKGNAME.rpm
```
#### Push to Packagecloud
```
PKGNAME="homer-app-$RELEASE-amd64"
package_cloud push qxip/sipcapture/debian/stretch $PKGNAME.deb
package_cloud push qxip/sipcapture/debian/buster $PKGNAME.deb
package_cloud push qxip/sipcapture/el/7 $PKGNAME.rpm
```

