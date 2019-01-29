import { pick, cloneDeep, isEmpty } from 'lodash';

class AppPreferencesUsers {
  constructor($uibModal, $state, UserService, log) {
    'ngInject';
    this.log = log;
    this.log.initLocation('AppPreferencesUsers');
    this.$uibModal = $uibModal;
    this.$state = $state;
    this.UserService = UserService;
    this.smartTable = {
      options: {
        pagination: '',
        items_by_page: 10,
        displayed_pages: 7,
      },
    };
  }

  $onInit() {
    this.userCols = Object.keys(this.users[0]).slice(0, 4);
    
    this.users.forEach(user => {
      user.password = undefined;
    });
  }

  addUser() {
    this.$uibModal.open({
      component: 'appPreferencesUsersAddEditUser',
    }).result.then((user) => {
      this.addUserToStorage(user);
    });
  }

  editUser(user) {
    this.$uibModal.open({
      component: 'appPreferencesUsersAddEditUser',
      resolve: {
        user: () => {
          return cloneDeep(user);
        },
      },
    }).result.then((user) => {
      this.updateUserInStorage(user);
    });
  }

  async deleteUser(user) {
    try {
      await this.UserService.delete(user.guid);
      this._tableUserDelete(user);
    } catch (err) {
      this.log.error(err.message);
    }
  }

  async updateUserInStorage(user) {
    if (!user) {
      this.log.warn('no user was updated by modal');
      return;
    }

    try {
      const data = pick(user, ['guid', 'firstname', 'lastname', 'username', 'email', 'password', 'partid', 'usergroup', 'department']);
      await this.UserService.update(data);
      this._tableUserUpdate();
    } catch (err) {
      this.log.error(err.message);
    }
  }

  async addUserToStorage(user) {
    if (!user) {
      this.log.warn('no user was added by modal');
      return;
    }

    try {
      const data = pick(user, ['firstname', 'lastname', 'username', 'email', 'password', 'partid', 'usergroup', 'department']);
      await this.UserService.add(data);
      this._tableUserAdd(user);
    } catch (err) {
      this.log.error(err.message);
    }
  }

  _tableUserDelete(user) {
    this.users.splice(this.users.findIndex((u) => u.guid === user.guid), 1);
    this._reloadThisState();
  }

  _tableUserAdd(user) {
    this.users.push(user);
    this._reloadThisState();
  }

  _tableUserUpdate() {
    this._reloadThisState();
  }

  _reloadThisState() {
    this.$state.reload(this.$state.$current.name);
  }

  onAddUser({ row }) {
    if (!isEmpty(row)) {
      this.addUserToStorage(row);
    }
  }

  onDeleteUser({ row }) {
    if (!isEmpty(row)) {
      this.deleteUser(row);
    }
  }

  onEditUser({ row }) {
    if (!isEmpty(row)) {
      this.updateUserInStorage(row);
    }
  }
}

export default AppPreferencesUsers;
