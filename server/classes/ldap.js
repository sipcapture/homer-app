import LivingBeing from './living_being';
import ldap from 'ldapjs-no-python';

const table = 'users';

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
  constructor({ldapauth, username, password}) {
    this.ldapAuth = ldapauth;
    this.username = username;
    this.password = password;
  }

  /**
   * Get user data
   *
   * @param {array} columns of user table
   * @return {object} user data
   */
  async get(columns) {
    try {
    
      let userObject = {};
      
      if (this.username) {

        let client = ldap.createClient({
            url: this.ldapAuth.url
        });
	
	let dnRetrieved;
	let opts = {
		filter: this.ldapAuth.filter.replace("%USERNAME", this.username),
		scope: this.ldapAuth.scope
	};
        
	client.search(this.ldapAuth.dn, opts, function(err, res) {
		assert.ifError(err);
		res.on('searchEntry', function(entry) {
		   userObject = entry;
		    //console.log('entry: ' + JSON.stringify(entry.object));
		});
		res.on('searchReference', function(referral) {
		    //console.log('referral: ' + referral.uris.join());
		});
		res.on('error', function(err) {
		    //console.error('error: ' + err.message);
		});
		res.on('end', function(result) {
		    //console.log('status: ' + result.status);
		});
	});        

	client.bind(dnRetrieved, this.password, function(err) {
              assert.ifError(err);
        });            
     }

      return userObject;

    } catch (err) {
      throw new Error(`fail to get user: ${err.message}`);
    }
  }
}

export default LdapAuth;
