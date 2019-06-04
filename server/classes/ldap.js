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
  async get(columns) {

      let userObject = {};
      
      if(!this.username) return userObject;

    
      let client = ldap.createClient({url: this.ldapAuth.url});
	
      let opts = {
		filter: this.ldapAuth.filter.replace("%USERNAME\%", this.username),
		userdn: this.ldapAuth.userdn.replace("%USERNAME\%", this.username),
		scope: this.ldapAuth.scope
      };
	
      console.log("OPTS", opts);
	
      /*
	client.search(this.ldapAuth.dn, opts, function(err, res) {
	        
	        console.log("ERR", err);
	        console.log("RES", res);
	
		//assert.ifError(err);
		
		res.on('searchEntry', function(entry) {
		   userObject = entry;
		    console.log('entry: ' + JSON.stringify(entry.object));
		});
		res.on('searchReference', function(referral) {
		    console.log('referral: ' + referral.uris.join());
		});
		res.on('error', function(err) {
		    console.error('error: ' + err.message);
		});
		res.on('end', function(result) {
		    console.log('status: ' + result.status);
		});
	});        
	*/
      let dnRetrieved =  opts.userdn + ',' + this.ldapAuth.dn;
      console.log("USERDN", dnRetrieved);

     Promise.promisifyAll(client);
     client.bindAsync(dnRetrieved, this.password).then(function() {
		console.log("DONE");
	}).then(function(search) { // flatten your chain
	    console.log("SEARCH", search);
	}).then(function(entry){
	    var user = entry;
	    console.log(user);
	}).catch(function(err) { // always catch errors!
	    console.error(err);
     });
  }
}

export default LdapAuth;
