const ROUTER = {
  ROOT_STATE: {
    NAME: 'hepic',
  },
  DASHBOARD: {
    NAME: 'hepic.dashboard',
    PATH: '/dashboard/:boardID',
    DESCRIPTION: 'dashboard',
    SECURE: true,
  },
  DASHFRAME: {
    NAME: 'hepic.dashframe',
    PATH: '/dashframe/:boardID',
    DESCRIPTION: 'dashframe',
    SECURE: true,
  },
  HOME: {
    NAME: 'home',
    PATH: '/dashboard/home',
    DESCRIPTION: 'home',
    SECURE: true,
  },
  LOGIN: {
    NAME: 'login',
    PATH: '/login',
    DESCRIPTION: 'login',
    SECURE: false,
  },
  SEARCH: {
    NAME: 'hepic.search',
    PATH: '/search',
    DESCRIPTION: 'search',
    SECURE: true,
  },
  REMOTE: {
    NAME: 'hepic.remotesearch',
    PATH: '/remotesearch',
    DESCRIPTION: 'remotesearch',
    SECURE: true,
  },
  PREFERENCES: {
    NAME: 'hepic.preferences',
    PATH: '/preferences',
    DESCRIPTION: 'app preferences',
    SECURE: true,
  },
  PREFERENCES_USERS: {
    NAME: 'hepic.preferences.users',
    CHILDNAME: 'users',
    CHILDPATH: 'users',
    PATH: '/users',
    DESCRIPTION: 'users preferences',
    SECURE: true,
  },
  PREFERENCES_USER_SETTINGS: {
    NAME: 'hepic.preferences.usersettings',
    CHILDNAME: 'user settings',
    CHILDPATH: 'usersettings',
    PATH: '/usersettings',
    DESCRIPTION: 'user settings preferences',
    SECURE: true,
  },
  PREFERENCES_ALIAS: {
    NAME: 'hepic.preferences.alias',
    CHILDNAME: 'alias',
    CHILDPATH: 'alias',
    PATH: '/alias',
    DESCRIPTION: 'alias preferences',
    SECURE: true,
  },
  SETTINGSMAIN: {
    NAME: 'hepic.settings',
    PATH: '/settings',
    DESCRIPTION: 'index',
    SECURE: true,
  },
  SETTINGSPROFILE: {
    NAME: 'hepic.settings.profile',
    PATH: '/profile/:paramID',
    DESCRIPTION: 'settings/profile',
    TYPE: 'Profile',
    SECURE: true,
  },
  SETTINGSADMIN: {
    NAME: 'hepic.settings.admin',
    PATH: '/admin/:paramID',
    DESCRIPTION: 'settings/admin',
    TYPE: 'Admin',
    SECURE: true,
  },

  USER_LOGGED_OUT: 'auth:user:loggedOut',
};

export default ROUTER;
