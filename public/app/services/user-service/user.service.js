class UserService {
  constructor($http, API, APP_PREF_SCHEMA) {
    this.$http = $http;
    this.API = API.PREFERENCES.USER;
    this.APP_PREF_SCHEMA = APP_PREF_SCHEMA;
  }

  /*
  * @return {object} data and schema
  *   {array} data
  *   {object} schema
  */
  async getAll() {
    try {
      const res = await this.$http.get(this.API.GETALL);
      return {
        data: res.data.data,
        schema: this.APP_PREF_SCHEMA.USERS,
      };
    } catch (err) {
      throw new Error(`fail to get all users: ${err.message}`);
    }
  }

  /*
  * @return {object} API confirm
  */
  async add({name, username, email, password}) {
    try {
      return await this.$http.post(this.API.ADD, {name, username, email, password});
    } catch (err) {
      throw new Error(`fail to add user: ${err.message}`);
    }
  }

  /*
  * @return {object} API confirm
  */
  async update({name, username, email, password}) {
    try {
      return await this.$http.put([this.API.UPDATE, userGuid].join('/'));
    } catch (err) {
      throw new Error(`fail to update user: ${err.message}`);
    }
  }

  /*
  * @return {object} API confirm
  */
  async delete(userGuid) {
    try {
      return await this.$http.delete([this.API.UPDATE, userGuid].join('/'));
    } catch (err) {
      throw new Error(`fail to delete user: ${err.message}`);
    }
  }
}

export default UserService;
