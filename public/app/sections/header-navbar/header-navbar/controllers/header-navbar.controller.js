import '../style/header-navbar.style.css';

class HeaderNavbar {
  constructor($log, AuthenticationService, CONFIGURATION, ROUTER) {
    'ngInject';
    this.$log = $log;
    this.AuthenticationService = AuthenticationService;
    this.CONFIGURATION = CONFIGURATION;
    this.ROUTER = ROUTER;
    this.logoText = this.CONFIGURATION.APP_NAME;
    this.preferences = {
      path: this.ROUTER.PREFERENCES.PATH,
      name: this.ROUTER.PREFERENCES.NAME,
    };
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
