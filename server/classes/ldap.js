import LivingBeing from './living_being';
import ldap from 'ldapjs-no-python';
import Promise from 'bluebird';

/**
 * A class to handle users in DB
 */
class LdapAuth {
  /**
   * Class constructor
   *
   * @param {object} server of hapi
   * @param {object} username
   */
  constructor({ldapAuth, username, password}) {
    this.ldapAuth = ldapAuth;
    this.username = username;
    this.password = password;
  }

  /**
   * Get user data
   *
   * @param {array} columns of user table
   * @return {object} user data
   */
  get(columns) {

      return new Promise((resolve, reject) => {        
      
              let userObject = {auth: false};      
              if(!this.username) return resolv(userObject);

              try {
                
                  let client = ldap.createClient({url: this.ldapAuth.url});      
                  let opts = {
                        filter: this.ldapAuth.filter.replace("%USERNAME\%", this.username),		
                        scope: this.ldapAuth.scope
                  };
	
                  let userDN = this.ldapAuth.userdn.replace("%USERNAME\%", this.username);
                  let dnRetrieved =  userDN + ',' + this.ldapAuth.dn;

                  let that = this;
                  client.bind(dnRetrieved, this.password, function(res) {
                          client.search(that.ldapAuth.dn, opts, function(err, res) {
                                res.on('searchEntry', function(entry) {
                                        userObject.auth = true;
                                        userObject.data = entry.object;
                                        userObject.guid = entry.object.gidNumber;
                                        console.log('entry: ' + JSON.stringify(entry.object));
                                        console.log('userObject: ' +  JSON.stringify(userObject));
                                });
                                res.on('end', function(result) {
                                      //console.log('status: ' + result.status);
                                      //console.log("OBJECT", userObject);
                                      client.unbind();	
                                      return resolve(userObject);
                                });                      
                          });                                  		                          
                  });
        
            } catch (err) {
                throw new Error(`fail to get user: ${err.message}`);
                return reject(userObject);
            }                             
      });
  }
}

export default LdapAuth;
