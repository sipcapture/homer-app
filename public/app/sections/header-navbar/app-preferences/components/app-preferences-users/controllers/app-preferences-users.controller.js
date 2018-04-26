import {pick, assign} from 'lodash';
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
      component: 'appPreferencesUsersAddUser',
    }).result.then((user) => {
      this.storeUser(user);
    }).catch((err) => {
      this.log.info(err);
    });
  }
  
  editUser() {
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

  async storeUser(user) {
    if (!user) {
      this.log.warn('no user was added by modal');
      return;
    }

    const newUser = assign(pick(user, ['username', 'email', 'password']), this._createName(user));
    try {
      const resp = await this.UserService.add(newUser);
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

  /*
  * @return {object} contains name
  */
  _createName(user) {
    return {
      name: [user.firstname, user.lastname].join(' '),
    };
  }
}

export default AppPreferencesUsers;
