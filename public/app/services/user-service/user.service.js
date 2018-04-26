import Promise from 'bluebird';
import {pick, includes, isEqual} from 'lodash';

class UserService {
  constructor($http, API) {
    this.$http = $http;
    this.API = API.PREFERENCES.USER;
  }

  /*
  * @return {object} data and schema
  *   {array} data
  *   {object} schema
  */
  async getAll() {
    try {
      const res = await this.$http.get(this.API.GETALL);
      return res.data.data;
    } catch (err) {
      throw new Error(`fail to get all users: ${err.message}`);
    }
  }

  /*
  * Save users in DB
  *
  * @param {array} data to store
  * @return {object} API confirm
  */
  async store(data) {
    try {
      const editor = {
        users: data,
        guids: this._getGuids(data),
      };

      const resp = await this.getAll();

      const db = {
        users: resp.data,
        guids: this._getGuids(resp.data),
      };

      await this._batchDeleteUsers(db.users, editor.guids);
      await this._batchUpdateUsers(editor.users, db.users);
      await this._batchAddUsers(editor.users, db.guids);
    } catch (err) {
      throw new Error(`fail to store users: ${err.message}`);
    }
  }

  async _batchDeleteUsers(dbUsers, editorGuids) {
    try {
      await Promise.each(dbUsers, async (user) => {
        if (this._userDeleted(user.guid, editorGuids)) {
          const resp = await this.delete(user.guid);
          if (resp && resp.status >= 400) {
            throw new Error(resp.data.message);
          }
        }
      });
    } catch (err) {
      throw new Error(`fail to delete users: ${err.message}`);
    }
  }

  async _batchAddUsers(editorUsers, dbGuids) {
    try {
      await Promise.each(editorUsers, async (user) => {
        if (this._userAdded(user.guid, dbGuids)) {
          const resp = await this.add(pick(user, ['name', 'username', 'email', 'password']));
          if (resp && resp.status >= 400) {
            throw new Error(resp.data.message);
          }
        }
      });
    } catch (err) {
      throw new Error(`fail to add users: ${err.message}`);
    }
  }

  async _batchUpdateUsers(editorUsers, dbUsers) {
    try {
      await Promise.each(editorUsers, async (user) => {
        if (this._userUpdated(user, dbUsers)) {
          const resp = await this.update(pick(user, ['guid', 'name', 'username', 'email', 'password']));
          if (resp && resp.status >= 400) {
            throw new Error(resp.data.message);
          }
        }
      });
    } catch (err) {
      throw new Error(`fail to update users: ${err.message}`);
    }
  }

  _getGuids(arr) {
    let guids = [];
    arr.forEach((user) => {
      guids.push(user.guid);
    });
    return guids;
  }

  _userDeleted(guid, editorGuids) {
    return includes(editorGuids, guid) ? false : true;
  }

  _passwordUpdated(password) {
    return password && password.length;
  }

  _userUpdated(user, dbUsers) {
    const userToUpdate = dbUsers.filter((u) => u.guid === user.guid)[0];
    if (!userToUpdate) {
      return false;
    }

    if (this._passwordUpdated(user.password)) {
      return true;
    }

    delete user.password;
    delete userToUpdate.password;
    if (!isEqual(userToUpdate, user)) {
      return true;
    }

    return false;
  }

  _userAdded(guid, dbGuids) {
    return !guid || !includes(dbGuids, guid) ? true : false;
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
  async update({guid, name, username, email, password}) {
    try {
      return await this.$http.put([this.API.UPDATE, guid].join('/'), {name, username, email, password});
    } catch (err) {
      throw new Error(`fail to update user: ${err.message}`);
    }
  }

  /*
  * @return {object} API confirm
  */
  async delete(guid) {
    try {
      return await this.$http.delete([this.API.DELETE, guid].join('/'));
    } catch (err) {
      throw new Error(`fail to delete user: ${err.message}`);
    }
  }
}

export default UserService;
