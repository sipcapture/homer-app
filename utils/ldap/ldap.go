// Package ldap provides a simple ldap client to authenticate,
// retrieve basic information and groups for a user.
//https://github.com/jtblin/go-ldap-clien
package ldap

import (
	"crypto/tls"
	"errors"
	"fmt"

	"github.com/sirupsen/logrus"
	"gopkg.in/ldap.v3"
)

type LDAPClient struct {
	Attributes          []string
	Base                string
	BindDN              string
	BindPassword        string
	GroupFilter         string // e.g. "(memberUid=%s)"
	GroupAttribute      string // e.g. "memberOf" / "cn"
	Host                string
	ServerName          string
	UserFilter          string // e.g. "(uid=%s)"
	Conn                *ldap.Conn
	Port                int
	InsecureSkipVerify  bool
	UseSSL              bool
	Anonymous           bool
	UserDN              string
	SkipTLS             bool
	AdminGroup          string
	AdminMode           bool
	UserGroup           string
	UserMode            bool
	UseDNForGroupSearch bool

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
		logrus.Error("Couldn't connect to LDAP: ", err)
		return false, false, nil, err
	}

	isAdmin := lc.AdminMode
	user := map[string]string{}

	if !lc.Anonymous {
		// First bind with a read only user
		if lc.BindDN != "" && lc.BindPassword != "" {
			err := lc.Conn.Bind(lc.BindDN, lc.BindPassword)
			if err != nil {
				logrus.Error("Couldn't auth user: ", err)
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
			logrus.Error("Couldn't execute search request: ", err)
			logrus.Debug("LDAP search failed with base ", lc.Base, " and user filter ", userFilter)
			return false, false, nil, err
		}

		if len(sr.Entries) < 1 {
			err := errors.New("User does not exist")
			logrus.Error("Could not find user: ", err)
			return false, false, nil, err
		}

		if len(sr.Entries) > 1 {
			err := errors.New("Too many entries returned")
			logrus.Error("Could not find user: ", err)
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
			err := errors.New("No username/password provided")
			logrus.Error("Could not auth user: ", err)
			return false, false, user, err
		}

		// Rebind as the read only user for any further queries
		if lc.BindDN != "" && lc.BindPassword != "" {
			err = lc.Conn.Bind(lc.BindDN, lc.BindPassword)
			if err != nil {
				logrus.Error("Couldn't rebind with provided BindDN and BindPassword: ", err)
				return true, isAdmin, user, err
			}
		}
	} else {

		logrus.Debug("Sending anonymous request...")

		if lc.UserDN != "" && username != "" && password != "" {
			userDN := fmt.Sprintf(lc.UserDN, username)
			err = lc.Conn.Bind(userDN, password)
			if err != nil {
				logrus.Error("error ldap request...", err)
				return false, false, user, err
			}
		} else {
			logrus.Error("No username/password provided...", err)
			return false, false, user, errors.New("No username/password provided")
		}
	}

	logrus.Debug("Sending response request...", user)
	return true, isAdmin, user, nil
}

// GetGroupsOfUser returns the group for a user.
func (lc *LDAPClient) GetGroupsOfUser(username string) ([]string, error) {
	err := lc.Connect()
	defer lc.Close()

	if err != nil {
		return nil, err
	}

	searchRequest := ldap.NewSearchRequest(
		lc.Base,
		ldap.ScopeWholeSubtree, ldap.NeverDerefAliases, 0, 0, false,
		fmt.Sprintf(lc.GroupFilter, username),
		[]string{lc.GroupAttribute},
		nil,
	)
	sr, err := lc.Conn.Search(searchRequest)
	if err != nil {
		return nil, err
	}
	groups := []string{}
	for _, entry := range sr.Entries {
		groups = append(groups, entry.GetAttributeValues(lc.GroupAttribute)...)
	}
	return groups, nil
}
