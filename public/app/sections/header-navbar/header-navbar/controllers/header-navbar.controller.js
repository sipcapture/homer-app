import '../style/header-navbar.style.css';

class HeaderNavbar {
  constructor($log, AuthenticationService, CONFIGURATION, ROUTER) {
    'ngInject';
    this.$log = $log;
    this.AuthenticationService = AuthenticationService;
    this.CONFIGURATION = CONFIGURATION;
    this.ROUTER = ROUTER;
    this.logoText = this.CONFIGURATION.APP_NAME;
    this.logoUrl = this.CONFIGURATION.APP_LOGO;
    this.preferences_users = {
      path: this.ROUTER.PREFERENCES_USERS.PATH,
      name: this.ROUTER.PREFERENCES_USERS.NAME,
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
