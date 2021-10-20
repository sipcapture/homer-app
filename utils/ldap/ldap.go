// Package ldap provides a simple ldap client to authenticate,
// retrieve basic information and groups for a user.
//https://github.com/jtblin/go-ldap-clien
package ldap

import (
	"crypto/tls"
	"errors"
	"fmt"
	"strings"

	"github.com/sipcapture/homer-app/utils/logger"
	"gopkg.in/ldap.v3"
)

// scope choices
const (
	ScopeBaseObject   = 0
	ScopeSingleLevel  = 1
	ScopeWholeSubtree = 2
)

// ScopeMap contains human readable descriptions of scope choices
var ScopeMap = map[int]string{
	ScopeBaseObject:   "Base Object",
	ScopeSingleLevel:  "Single Level",
	ScopeWholeSubtree: "Whole Subtree",
}

// derefAliases
const (
	NeverDerefAliases   = 0
	DerefInSearching    = 1
	DerefFindingBaseObj = 2
	DerefAlways         = 3
)

// DerefMap contains human readable descriptions of derefAliases choices
var DerefMap = map[int]string{
	NeverDerefAliases:   "NeverDerefAliases",
	DerefInSearching:    "DerefInSearching",
	DerefFindingBaseObj: "DerefFindingBaseObj",
	DerefAlways:         "DerefAlways",
}

type LDAPClient struct {
	Attributes          []string `default:"[givenName,sn,mail,uid,distinguishedName]"`
	Base                string   `default:"dc=example,dc=com"`
	BindDN              string   `default:""`
	BindPassword        string   `default:""`
	GroupFilter         string   `default:"(memberUid=%s)"`
	GroupAttribute      []string `default:"[memberOf]"`
	Host                string   `default:"127.0.0.1"`
	ServerName          string   `default:""`
	UserFilter          string   `default:"(uid=%s)"`
	Conn                *ldap.Conn
	Port                int    `default:"389"`
	InsecureSkipVerify  bool   `default:"true"`
	ShortGroup          bool   `default:"false"`
	ShortDNForGroup     bool   `default:"false"`
	NestedGroup         bool   `default:"false"`
	UseSSL              bool   `default:"false"`
	Anonymous           bool   `default:"false"`
	UserDN              string `default:""`
	SkipTLS             bool   `default:"true"`
	AdminGroup          string `default:""`
	AdminMode           bool   `default:"false"`
	UserGroup           string `default:""`
	UserMode            bool   `default:"false"`
	UseDNForGroupSearch bool   `default:"false"`
	DerefName           string `default:""`
	DerefValue          int    `default:"3"`
	SearchLimit         int    `default:"0"`
	GroupLimit          int    `default:"0"`
	TimeLimit           int    `default:"0"`
	ScopeName           string `default:""`
	ScopeValue          int    `default:"2"`

	ClientCertificates []tls.Certificate // Adding client certificates
}

// Connect connects to the ldap backend.
func (lc *LDAPClient) Connect() error {
	if lc.Conn == nil {
		var l *ldap.Conn
		var err error
		address := fmt.Sprintf("%s:%d", lc.Host, lc.Port)
		if !lc.UseSSL {
			l, err = ldap.Dial("tcp", address)
			if err != nil {
				return err
			}

			// Reconnect with TLS
			if !lc.SkipTLS {
				err = l.StartTLS(&tls.Config{InsecureSkipVerify: true})
				if err != nil {
					return err
				}
			}
		} else {
			config := &tls.Config{
				InsecureSkipVerify: lc.InsecureSkipVerify,
				ServerName:         lc.ServerName,
			}
			if lc.ClientCertificates != nil && len(lc.ClientCertificates) > 0 {
				config.Certificates = lc.ClientCertificates
			}
			l, err = ldap.DialTLS("tcp", address, config)
			if err != nil {
				return err
			}
		}

		lc.Conn = l
	}
	return nil
}

// Close closes the ldap backend connection.
func (lc *LDAPClient) Close() {
	if lc.Conn != nil {
		lc.Conn.Close()
		lc.Conn = nil
	}
}

// Authenticate authenticates the user against the ldap backend.
func (lc *LDAPClient) Authenticate(username, password string) (bool, bool, map[string]string, error) {

	err := lc.Connect()

	if err != nil {
		logger.Error("Couldn't connect to LDAP: ", err)
		return false, false, nil, err
	}

	isAdmin := lc.AdminMode
	user := map[string]string{}

	if !lc.Anonymous {
		// First bind with a read only user
		if lc.BindDN != "" && lc.BindPassword != "" {
			err := lc.Conn.Bind(lc.BindDN, lc.BindPassword)
			if err != nil {
				logger.Error("Couldn't auth user and force to reconnect: ", err)
				lc.Close()
				/* second try */
				return false, false, nil, err
			}
		}

		attributes := append(lc.Attributes, "dn")
		userFilter := fmt.Sprintf(lc.UserFilter, username)
		// Search for the given username
		searchRequest := ldap.NewSearchRequest(
			lc.Base,
			ldap.ScopeWholeSubtree, ldap.NeverDerefAliases, 0, 0, false,
			userFilter,
			attributes,
			nil,
		)

		sr, err := lc.Conn.Search(searchRequest)
		if err != nil {
			logger.Error("Couldn't execute search request: ", err)
			logger.Debug("LDAP search failed with base ", lc.Base, " and user filter ", userFilter)
			return false, false, nil, err
		}

		if len(sr.Entries) < 1 {
			err := errors.New("user does not exist")
			logger.Error("Could not find user: ", err)
			return false, false, nil, err
		}

		if len(sr.Entries) > 1 {
			err := errors.New("too many entries returned")
			logger.Error("Could not find user: ", err)
			return false, false, nil, err
		}

		userDN := sr.Entries[0].DN
		for _, attr := range lc.Attributes {
			if attr == "dn" {
				user["dn"] = sr.Entries[0].DN
			} else {
				user[attr] = sr.Entries[0].GetAttributeValue(attr)
			}
		}

		if userDN != "" && password != "" {
			err = lc.Conn.Bind(userDN, password)
			if err != nil {
				return false, false, user, err
			}
		} else {
			err := errors.New("no username/password provided")
			logger.Error("Could not auth user: ", err)
			return false, false, user, err
		}

		// Rebind as the read only user for any further queries
		if lc.BindDN != "" && lc.BindPassword != "" {
			err = lc.Conn.Bind(lc.BindDN, lc.BindPassword)
			if err != nil {
				logger.Error("Couldn't rebind with provided BindDN and BindPassword: ", err)
				return true, isAdmin, user, err
			}
		}
	} else {

		logger.Debug("Sending anonymous request...")

		if lc.UserDN != "" && username != "" && password != "" {
			userDN := fmt.Sprintf(lc.UserDN, username)
			err = lc.Conn.Bind(userDN, password)
			if err != nil {
				logger.Error("error ldap request...", err)
				return false, false, user, err
			}
		} else {
			logger.Error("No username/password provided...", err)
			return false, false, user, errors.New("no username/password provided")
		}
	}

	logger.Debug("Sending response request...", user)
	return true, isAdmin, user, nil
}

// GetGroupsOfUser returns the group for a user.
func (lc *LDAPClient) GetGroupsOfUser(username string) ([]string, error) {

	parsedUsername := username

	logger.Debug("Group search by: ", parsedUsername)

	if lc.ShortDNForGroup {
		dn, err := ldap.ParseDN(username)
		if err == nil && len(dn.RDNs) > 0 {
			for _, rdn := range dn.RDNs {
				for _, rdnTypeAndValue := range rdn.Attributes {
					logger.Debug(fmt.Sprintf("Attribute: [%s] -> [%s]", rdnTypeAndValue.Type, rdnTypeAndValue.Value))
					if strings.EqualFold(rdnTypeAndValue.Type, "CN") {
						logger.Debug("Found user: ", rdnTypeAndValue.Value)
						parsedUsername = rdnTypeAndValue.Value
					}
				}
			}
		}
	}

	logger.Debug("New user: ", parsedUsername)

	err := lc.Connect()
	defer lc.Close()

	if err != nil {
		return nil, err
	}

	logger.Debug("Searching ldap group for user: ", parsedUsername)

	searchRequest := ldap.NewSearchRequest(
		lc.Base,
		lc.ScopeValue, lc.DerefValue, lc.GroupLimit, lc.TimeLimit, false,
		fmt.Sprintf(lc.GroupFilter, parsedUsername),
		lc.GroupAttribute,
		nil,
	)
	sr, err := lc.Conn.Search(searchRequest)
	if err != nil {
		logger.Error(fmt.Sprintf("couldn't find user group: [%s], ", parsedUsername), err)
		return nil, err
	}

	notFound := false

	groups := []string{}
	for _, entry := range sr.Entries {
		for _, attr := range lc.GroupAttribute {
			values := entry.GetAttributeValues(attr)
			if lc.ShortGroup {
				for _, val := range values {
					dn, err := ldap.ParseDN(val)
					if err == nil && len(dn.RDNs) > 0 {
						for _, rdn := range dn.RDNs {
							for _, rdnTypeAndValue := range rdn.Attributes {
								logger.Debug(fmt.Sprintf("Attribute Group: [%s] -> [%s]", rdnTypeAndValue.Type, rdnTypeAndValue.Value))
								if strings.EqualFold(rdnTypeAndValue.Type, "CN") {
									logger.Debug("Found group: ", rdnTypeAndValue.Value)
									if rdnTypeAndValue.Value == lc.AdminGroup {
										logger.Debug("Short: User is a member of the admin group ", lc.AdminGroup)
										groups = append(groups, rdnTypeAndValue.Value)
										return groups, nil
									} else if rdnTypeAndValue.Value == lc.UserGroup {
										logger.Debug("Short: User is a member of the user group ", lc.UserGroup)
										notFound = true
									} else if lc.NestedGroup {
										groups = append(groups, rdnTypeAndValue.Value)
									}
								}
							}
						}
					}
				}
			} else {
				for _, val := range values {
					if val == lc.AdminGroup {
						logger.Debug("Full: User is a member of the admin group ", lc.AdminGroup)
						groups = append(groups, val)
						return groups, nil
					} else if val == lc.UserGroup {
						logger.Debug("Full: User is a member of the user group ", lc.UserGroup)
						groups = append(groups, val)
						notFound = true
					} else if lc.NestedGroup {
						groups = append(groups, val)
					}
				}
			}
		}
	}

	if !notFound && lc.NestedGroup && len(groups) > 0 {

		logger.Debug("Checking now nested group...")

		groupSearch := lc.UserGroup

		if lc.AdminGroup != "" {
			groupSearch = lc.AdminGroup
		}

		if groupSearch == "" {
			logger.Debug("Nested group - empty groupSearch")
			return groups, nil
		}

		for _, group := range groups {

			sr, err := lc.Conn.Compare(groupSearch, "member", group)
			if err != nil {
				logger.Error("NestedGroup couldn't find group: [" + group + "] Error: [" + err.Error() + "]")
				return nil, err
			}
			if sr {
				groups = append(groups, groupSearch)
				logger.Debug("Found group nested group: ", groupSearch)
				break
			}
		}
	}

	logger.Debug("Found ldap groups: ", groups)

	return groups, nil
}
