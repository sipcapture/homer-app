const ROUTER = {
  DASHBOARD: {
    NAME: 'dashboard',
    PATH: '/dashboard/:boardID',
    DESCRIPTION: 'dashboard',
    SECURE: true
  },
  DASHFRAME: {
    NAME: 'dashframe',
    PATH: '/dashframe/:boardID',
    DESCRIPTION: 'dashframe',
    SECURE: true
  },
  HOME: {
    NAME: 'home',
    PATH: '/dashboard/home',
    DESCRIPTION: 'home',
    SECURE: true
  },
  LOGIN: {
    NAME: 'login',
    PATH: '/login',
    DESCRIPTION: 'login',
    SECURE: false
  },
  SEARCH: {
    NAME: 'search',
    PATH: '/search/:protoID',
    DESCRIPTION: 'search',
    SECURE: true
  },
  SETTINGSMAIN: {
    NAME: 'settings',
    PATH: '/settings',
    DESCRIPTION: 'index',
    SECURE: true
  },
  SETTINGSPROFILE: {
    NAME: 'settings.profile',
    PATH: '/profile/:paramID',
    DESCRIPTION: 'settings/profile',
    TYPE: 'Profile',
    SECURE: true
  },
  SETTINGSADMIN: {
    NAME: 'settings.admin',
    PATH: '/admin/:paramID',
    DESCRIPTION: 'settings/admin',
    TYPE: 'Admin',
    SECURE: true
  },

  USER_LOGGED_OUT: 'auth:user:loggedOut'
};

export default ROUTER;
