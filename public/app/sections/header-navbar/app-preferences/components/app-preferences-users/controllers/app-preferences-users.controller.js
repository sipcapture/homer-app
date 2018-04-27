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
    this.users = this.appPreferencesEditorData;
  }

  addUser() {
    this.$uibModal.open({
      component: 'appPreferencesUsersAddEditUser',
    }).result.then((user) => {
      this.addUserToStorage(user);
    }).catch((err) => {
      this.log.info(err);
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
    }).catch((err) => {
      this.log.info(err);
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
        const resp = await this.UserService.delete(user.guid);
        if (resp.status >= 400) {
          this.log.error(resp.data.message || resp.data.error);
        } else {
          this._tableUserDelete(user);
        }
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
      const resp = await this.UserService.update(pick(user, ['username', 'email', 'password', 'name', 'guid']));
      if (resp.status >= 400) {
        this.log.error(resp.data.message || resp.data.error);
      } else {
        this._tableUserUpdate();
      }
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
      const resp = await this.UserService.add(pick(user, ['username', 'email', 'password', 'name']));
      if (resp.status >= 400) {
        this.log.error(resp.data.message || resp.data.error);
      } else {
        this._tableUserAdd(user);
      }
    } catch (err) {
      this.log.error(err.message);
    }
  }

  _tableUserDelete(user) {
    this.users.splice(this.users.findIndex((u) => u.guid === user.guid), 1);
    this.$state.reload();
  }

  _tableUserAdd(user) {
    this.users.push(user);
    this.$state.reload();
  }

  _tableUserUpdate() {
    this.$state.reload();
  }
}

export default AppPreferencesUsers;
