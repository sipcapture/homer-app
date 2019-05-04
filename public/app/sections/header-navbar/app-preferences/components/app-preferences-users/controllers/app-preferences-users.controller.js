import {pick, cloneDeep} from 'lodash';
import swal from 'sweetalert';

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
    const mustDelete = await swal({
      icon: 'warning',
      title: 'Delete user?',
      text: 'Once deleted, you will not be able to recover this!',
      buttons: true,
      dangerMode: true,
    });

    if (mustDelete) {
      try {
        await this.UserService.delete(user.guid);
        this._tableUserDelete(user);
      } catch (err) {
        this.log.error(err.message);
      }
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
    this.$state.reload();
  }
}

export default AppPreferencesUsers;
