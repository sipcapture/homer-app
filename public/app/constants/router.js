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
    PATH: '/search/:protoID',
    DESCRIPTION: 'search',
    SECURE: true,
  },
  PREFERENCES: {
    NAME: 'hepic.preferences',
    PATH: '/preferences',
    DESCRIPTION: 'app preferences',
    SECURE: true,
  },
  PREFERENCES_USER_EDITOR: {
    NAME: 'hepic.preferences.users',
    PATH: '/users',
    DESCRIPTION: 'users preferences editor',
    SECURE: true,
  },
  PREFERENCES_MOCK_EDITOR: {
    NAME: 'hepic.preferences.mock',
    PATH: '/mock',
    DESCRIPTION: 'mock preferences editor',
    SECURE: true,
  },
  PREFERENCES_EDITOR: {
    NAME: 'hepic.preferences.app-preferences-editor',
    PATH: '/app-preferences-editor',
    DESCRIPTION: 'app preferences editor',
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
