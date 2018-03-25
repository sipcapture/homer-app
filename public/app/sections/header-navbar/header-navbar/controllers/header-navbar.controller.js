import '../style/header-navbar.style.css';

class HeaderNavbar {
  constructor($log, AuthenticationService, UI) {
    'ngInject';
    this.$log = $log;
    this.AuthenticationService = AuthenticationService;
    this.ui = UI;
  }

  $onInit() {
    this.navbar = {
      isCollapsed: true,
    };
  }

  logout() {
    this.AuthenticationService.logout().catch((error) => {
      this.$log.error('[HeaderNavbar]', '[init menu]', error);
    });
  }
}

export default HeaderNavbar;
