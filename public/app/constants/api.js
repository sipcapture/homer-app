const base = 'api/v3';

const API = {
  PREFERENCES: {
    USER: {
      GETALL: `${base}/users`,
      ADD: `${base}/users`,
      UPDATE: `${base}/users`,
      DELETE: `${base}/users`,
    },
    USER_SETTINGS: {
      GETALL: `${base}/user/settings`,
      ADD: `${base}/user/settings`,
      UPDATE: `${base}/user/settings`,
      DELETE: `${base}/user/settings`,
    },
    ALIAS: {
      GETALL: `${base}/alias`,
      ADD: `${base}/alias`,
      UPDATE: `${base}/alias`,
      DELETE: `${base}/alias`,
    },
    ADVANCED: {
      GETALL: `${base}/advanced`,
      ADD: `${base}/advanced`,
      UPDATE: `${base}/advanced`,
      DELETE: `${base}/advanced`,
    },
  },
  PROFILE: {
    STORE: 'api/v3/profile/store',
  },
  GLOBALPROFILE: {
    STORE: 'api/v3/advanced',
  },
  ADMIN: {
    PROFILES: 'api/v3/admin/profiles',
  },
  AUTH: '/api/v3/auth',
  DASHBOARD: {
    NODE: 'api/v3/dashboard/node',
    STORE: 'api/v3/dashboard/store',
    MENU: 'api/v3/dashboard/menu',
    INFO: 'api/v3/dashboard/info',
  },
  MAPPING: {
    PROTOCOLS: 'api/v3/mapping/protocols',
    FIELDS: 'api/v3/mapping/fields',
  },
  SHARE: {
    LINK: 'api/v3/share/link',
  },
  EXPORT: {
    CALL: {
      MESSAGES: 'api/v3/export/call/messages',
      TRANSACTION: {
        HTML: 'api/v3/export/call/transaction/html',
      },
    },
    PROTO: {
      MESSAGES: 'api/v3/export/proto/messages',
    },
    REGISTRATION: {
      MESSAGES: 'api/v3/export/registration/messages',
    },
  },
  REGISTRATION: {
    TRANSACTION: 'api/v3/registration/transaction',
  },
  CALL: {
    TRANSACTION: 'api/v3/call/transaction',
    REPORT: {
      LOG: 'api/v3/call/report/log',
      RTCP: 'api/v3/call/report/rtcp',
      RTC: 'api/v3/call/report/rtc',
      QOS: 'api/v3/call/report/qos',
      QUALITY: 'api/v3/call/report/quality',
      REMOTELOG: 'api/v3/call/report/remotelog',
    },
    RECORDING: {
      INFO: 'api/v3/call/recording/info',
      DATA: 'api/v3/call/recording/data',
      DOWNLOAD: 'api/v3/call/recording/download',
    },
  },
  PROTO: {
    TRANSACTION: 'api/v3/proto/transaction',
  },
  SEARCH: {
    PROTO: {
      DATA: 'api/v3/search/proto/data',
      MESSAGE: 'api/v3/search/proto/message',
    },
    REMOTE: {
      DATA: 'api/v3/search/remote/data',
      MESSAGE: 'api/v3/search/remote/message',
    },
    REGISTRATION: {
      DATA: 'api/v3/search/registration/data',
      MESSAGE: 'api/v3/search/registration/message',
    },
    METHOD: 'api/v3/search/method',
    CALL: {
      DATA: 'api/v3/search/call/data',
      MESSAGE: 'api/v3/search/call/message',
      EXPORT: {
        DATA: 'api/v3/search/call/export/data',
      },
    },
  },
};

export default API;
