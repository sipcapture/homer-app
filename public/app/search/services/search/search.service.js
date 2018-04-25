import {has} from 'lodash';

const SearchService = function($q, $http, UserProfile, API) {
  'ngInject';

  UserProfile.getAllServerRemoteProfile();

  let searchValue = {};

  let timerange = {
    fromdate: new Date(new Date().getTime() - 300 * 1000),
    todate: new Date(),
  };

  /* actual search data */
  let searchdata = {
    timestamp: {
      from: new Date(new Date().getTime() - 300 * 1000),
      to: new Date(),
    },
    param: {
      transaction: {
        call: true,
        registration: true,
        rest: true,
      },
      limit: 200,
    },
  };

  const setTimeRange = function(data) {
    timerange = data;
  };

  const getTimeRange = function() {
    return timerange;
  };

  const setSearchData = function(data) {
    searchdata = data;
  };

  const getSearchData = function() {
    return searchdata;
  };

  const setSearchValue = function(data) {
    searchValue = data;
  };

  const getSearchValue = function() {
    return searchValue;
  };

  const searchCallByParam = function(mdata) {
    const defer = $q.defer();
    $http.post(API.SEARCH.CALL.DATA, mdata, {
      handleStatus: [403, 503],
    }).then(
      /* good response */
      function(results) {
        results = has(results, 'data') ? results.data : results || [];
        defer.resolve(results);
      },
      /* bad response */
      function() {
        defer.reject('bad response combination');
      }
    );
    return defer.promise;
  };

  const searchMethod = function(data) {
    const defer = $q.defer();
    $http.post(API.SEARCH.METHOD, data, {
      handleStatus: [403, 503],
    }).then(
      /* good response */
      function(results) {
        results = has(results, 'data.data') ? results.data.data : results.data || [];
        defer.resolve(results);
      },
      /* bad response */
      function() {
        defer.reject('bad response combination');
      }
    );

    return defer.promise;
  };

  const searchCallMessage = function(data) {
    const defer = $q.defer();
    $http.post(API.SEARCH.CALL.MESSAGE, data, {
      handleStatus: [403, 503],
    }).then(
      /* good response */
      function(results) {
        results = has(results, 'data.data') ? results.data.data : results.data || [];
        defer.resolve(results);
      },
      /* bad response */
      function() {
        defer.reject('bad response combination');
      }
    );

    return defer.promise;
  };

  const searchCallByTransaction = function(data) {
    const defer = $q.defer();
    $http.post(API.CALL.TRANSACTION, data, {
      handleStatus: [403, 503],
    }).then(
      /* good response */
      function(results) {
        results = has(results, 'data.data') ? results.data.data : results.data || [];
        defer.resolve(results);
      },
      /* bad response */
      function() {
        defer.reject('bad response combination');
      }
    );

    return defer.promise;
  };

  const searchRegistrationByParam = function(mdata) {
    const defer = $q.defer();
    $http.post(API.SEARCH.REGISTRATION.DATA, mdata, {
      handleStatus: [403, 503],
    }).then(
      /* good response */
      function(results) {
        results = has(results, 'data.data') ? results.data.data : results.data || [];
        defer.resolve(results);
      },
      /* bad response */
      function() {
        defer.reject('bad response combination');
      }
    );

    return defer.promise;
  };

  const searchRegistrationMessage = function(data) {
    const defer = $q.defer();
    $http.post(API.SEARCH.REGISTRATION.MESSAGE, data, {
      handleStatus: [403, 503],
    }).then(
      /* good response */
      function(results) {
        results = has(results, 'data.data') ? results.data.data : results.data || [];
        defer.resolve(results);
      },
      /* bad response */
      function() {
        defer.reject('bad response combination');
      }
    );

    return defer.promise;
  };

  const searchRegistrationByTransaction = function(data) {
    const defer = $q.defer();
    $http.post(API.REGISTRATION.TRANSACTION, data, {
      handleStatus: [403, 503],
    }).then(
      /* good response */
      function(results) {
        results = has(results, 'data.data') ? results.data.data : results.data || [];
        defer.resolve(results);
      },
      /* bad response */
      function() {
        defer.reject('bad response combination');
      }
    );

    return defer.promise;
  };

  const searchProtoByParam = function(mdata) {
    const defer = $q.defer();
    $http.post(API.SEARCH.PROTO.DATA, mdata, {
      handleStatus: [403, 503],
    }).then(
      /* good response */
      function(results) {
        results = has(results, 'data.data') ? results.data.data : results.data || [];
        defer.resolve(results);
      },
      /* bad response */
      function() {
        defer.reject('bad response combination');
      }
    );

    return defer.promise;
  };

  const searchProtoMessage = function(data) {
    const defer = $q.defer();
    $http.post(API.SEARCH.PROTO.MESSAGE, data, {
      handleStatus: [403, 503],
    }).then(
      /* good response */
      function(results) {
        results = has(results, 'data.data') ? results.data.data : results.data || [];
        defer.resolve(results);
      },
      /* bad response */
      function() {
        defer.reject('bad response combination');
      }
    );

    return defer.promise;
  };

  const searchProtoByTransaction = function(data) {
    const defer = $q.defer();
    $http.post(API.PROTO.TRANSACTION, data, {
      handleStatus: [403, 503],
    }).then(
      /* good response */
      function(results) {
        results = has(results, 'data.data') ? results.data.data : results.data || [];
        defer.resolve(results);
      },
      /* bad response */
      function() {
        defer.reject('bad response combination');
      }
    );

    return defer.promise;
  };


  const searchCallRTCPReport = function(data) {
    const defer = $q.defer();
    $http.post(API.CALL.REPORT.RTCP, data, {
      handleStatus: [403, 503],
    }).then(
      /* good response */
      function(results) {
        results = has(results, 'data.data') ? results.data.data : results.data || [];
        defer.resolve(results);
      },
      /* bad response */
      function() {
        defer.reject('bad response combination');
      }
    );

    return defer.promise;
  };

  const searchQOSReport = function(data) {
    const defer = $q.defer();
    $http.post(API.CALL.REPORT.QOS, data, {
      handleStatus: [403, 503],
    }).then(
      /* good response */
      function(results) {
        results = has(results, 'data.data') ? results.data.data : results.data || [];
        defer.resolve(results);
      },
      /* bad response */
      function() {
        defer.reject('bad response combination');
      }
    );

    return defer.promise;
  };

  const searchLogReport = function(data) {
    const defer = $q.defer();
    $http.post(API.CALL.REPORT.LOG, data, {
      handleStatus: [403, 503],
    }).then(
      /* good response */
      function(results) {
        results = has(results, 'data.data') ? results.data.data : results.data || [];
        defer.resolve(results);
      },
      /* bad response */
      function() {
        defer.reject('bad response combination');
      }
    );

    return defer.promise;
  };

  const searchRtcReport = function(data) {
    const defer = $q.defer();
    $http.post(API.CALL.REPORT.RTC, data, {
      handleStatus: [403, 503],
    }).then(
      /* good response */
      function(results) {
        results = has(results, 'data.data') ? results.data.data : results.data || [];
        defer.resolve(results);
      },
      /* bad response */
      function() {
        defer.reject('bad response combination');
      }
    );

    return defer.promise;
  };

  const searchRemoteLog = function(data) {
    const defer = $q.defer();
    $http.post(API.CALL.REPORT.REMOTELOG, data, {
      handleStatus: [403, 503],
    }).then(
      /* good response */
      function(results) {
        results = has(results, 'data.data') ? results.data.data : results.data || [];
        defer.resolve(results);
      },
      /* bad response */
      function() {
        defer.reject('bad response combination');
      }
    );

    return defer.promise;
  };

  const searchQualityReport = function(type, data) {
    const defer = $q.defer();
    $http.post(API.CALL.REPORT.QUALITY+'/'+type, data, {
      handleStatus: [403, 503],
    }).then(
      /* good response */
      function(results) {
        results = has(results, 'data.data') ? results.data.data : results.data || [];
        defer.resolve(results);
      },
      /* bad response */
      function() {
        defer.reject('bad response combination');
      }
    );

    return defer.promise;
  };


  const loadNode = function() {
    const defer = $q.defer();
    $http.get(API.DASHBOARD.NODE, {
      handleStatus: [403, 503],
    }).then(
      /* good response */
      function(results) {
        results = has(results, 'data.data') ? results.data.data : results.data || [];
        defer.resolve(results);
      },
      /* bad response */
      function() {
        defer.reject('bad response combination');
      }
    );

    return defer.promise;
  };
  
  const loadMappingProtocols = function() {
    const defer = $q.defer();
    $http.get(API.MAPPING.PROTOCOLS, {
      handleStatus: [403, 503],
    }).then(
      /* good response */
      function(results) {
        results = has(results, 'data.data') ? results.data.data : results.data || [];
        defer.resolve(results);
      },
      /* bad response */
      function() {
        defer.reject('bad response combination');
      }
    );
    
    return defer.promise;
  };
      
  const loadMappingFields = function(id,transaction) {
    const defer = $q.defer();

    let url = API.MAPPING.FIELDS+'/'+id+'/'+transaction;        
    $http.get(url, {
      handleStatus: [403, 503],
    }).then(
      /* good response */
      function(results) {
        results = has(results, 'data.data') ? results.data.data : results.data || [];
        defer.resolve(results);
      },
      /* bad response */
      function() {
        defer.reject('bad response combination');
      }
    );
    
    return defer.promise;
  };
  

  const makePcapTextforTransaction = function(data, type, trans) {
    const defer = $q.defer();
    let url = API.EXPORT.CALL.MESSAGES+'/';
    if (trans == 'registration') url = API.EXPORT.REGISTRATION.MESSAGES+'/';
    else if (trans == 'proto') url = API.EXPORT.PROTO.MESSAGES+'/';

    let response = {
      responseType: 'arraybuffer',
      handleStatus: [403, 503],
    };
    if (type == 1) url += 'text';
    else if (type == 2) {
      url += 'cloud';
      response = {
        handleStatus: [403, 503],
      };
    } else url += 'pcap';

    console.log(response);

    $http.post(url, data, response).then(
      /* good response */
      function(results) {
        results = has(results, 'data.data') ? results.data.data : results.data || [];
        defer.resolve(results);
      },
      /* bad response */
      function() {
        defer.reject('bad response combination');
      }
    );

    return defer.promise;
  };

  const makeReportRequest = function(data) {
    const defer = $q.defer();
    let url = API.EXPORT.CALL.TRANSACTION.HTML;
    let response = {
      responseType: 'arraybuffer',
      handleStatus: [403, 503],
    };

    console.log(response);

    $http.post(url, data, response).then(
      /* good response */
      function(results) {
        results = has(results, 'data.data') ? results.data.data : results.data || [];
        defer.resolve(results);
      },
      /* bad response */
      function() {
        defer.reject('bad response combination');
      }
    );

    return defer.promise;
  };


  const downloadRecordingPcap = function(id, type) {
    const defer = $q.defer();
    let url = API.CALL.RECORDING.DOWNLOAD+'/'+type+'/'+id;
    let response = {
      responseType: 'arraybuffer',
      handleStatus: [403, 503],
    };

    $http.get(url, response).then(
      /* good response */
      function(results) {
        results = has(results, 'data.data') ? results.data.data : results.data || [];
        defer.resolve(results);
      },
      /* bad response */
      function() {
        defer.reject('bad response combination');
      }
    );

    return defer.promise;
  };


  const makePcapTextData = function(data, type) {
    const defer = $q.defer();
    let response = {
      responseType: 'arraybuffer',
      handleStatus: [403, 503],
    };
    let url = API.SEARCH.CALL.EXPORT.DATA+'/';
    if (type == 1) url += 'text';
    else if (type == 2) {
      url += 'cloud';
      response = {
        handleStatus: [403, 503],
      };
    } else if (type == 3) {
      url += 'count';
      response = {
        handleStatus: [403, 503],
      };
    } else url += 'pcap';

    $http.post(url, data, response).then(
      /* good response */
      function(results) {
        results = has(results, 'data.data') ? results.data.data : results.data || [];
        defer.resolve(results);
      },
      /* bad response */
      function() {
        defer.reject('bad response combination');
      }
    );

    return defer.promise;
  };

  const searchBlacklist = function(ip) {
    const defer = $q.defer();
    const profile = UserProfile.getServerProfile('dashboard');
    if (profile.blacklist && profile.blacklist_url) {
      $http.get(profile.blacklist_url + ip + '/events', {
        handleStatus: [403, 503],
      }).then(
        /* good response */
        function(results) {
          if (!results || !results.data || results.data.count < 1) {
            defer.reject('request failed');
          } else {
            results.data.ip = ip;
            results = has(results, 'data.data') ? results.data.data : results.data || [];
            defer.resolve(results);
          }
        },
        /* bad response */
        function() {
          defer.reject('bad response combination');
        }
      );
    } else {
      defer.reject('bad response combination');
    }

    return defer.promise;
  };

  const searchGeoLoc = function(ip) {
    const profile = UserProfile.getServerProfile('dashboard');
    const defer = $q.defer();
    if (profile.geolookup && profile.geolookup_url) {
      $http.get(profile.geolookup_url + ip, {
        handleStatus: [403, 503],
        async: true,
      }).then(
        /* good response */
        function(results) {
          if (!results || !results.data) {
            defer.reject('request failed');
          } else {
            results = has(results, 'data.data') ? results.data.data : results.data || [];
            // console.log('GEO-LOOKUP',ip,results);
            defer.resolve(results);
          }
        },
        /* bad response */
        function() {
          defer.reject('bad response combination');
        }
      );
    } else {
      defer.reject('bad response combination');
    }

    return defer.promise;
  };

  const createShareLink = function(data) {
    const defer = $q.defer();
    $http.post(API.SHARE.LINK, data, {
      handleStatus: [403, 503],
    }).then(
      /* good response */
      function(results) {
        results = has(results, 'data.data') ? results.data.data : results.data || [];
        defer.resolve(results);
      },
      /* bad response */
      function() {
        defer.reject('bad response combination');
      }
    );

    return defer.promise;
  };

  const searchMetaDataRecording = function(id) {
    const defer = $q.defer();
    $http.get(API.CALL.RECORDING.INFO+'/'+id, {
      handleStatus: [403, 503],
    }).then(
      /* good response */
      function(results) {
        results = has(results, 'data.data') ? results.data.data : results.data || [];
        defer.resolve(results);
      },
      /* bad response */
      function() {
        defer.reject('bad response combination');
      }
    );

    return defer.promise;
  };


  return {
    searchCallByParam,
    searchMethod,
    searchCallMessage,
    searchCallByTransaction,
    searchRegistrationByParam,
    searchRegistrationMessage,
    searchRegistrationByTransaction,
    searchProtoByParam,
    searchProtoMessage,
    searchProtoByTransaction,
    makePcapTextforTransaction,
    makeReportRequest,
    downloadRecordingPcap,
    makePcapTextData,
    createShareLink,
    getTimeRange,
    setTimeRange,
    getSearchData,
    setSearchData,
    getSearchValue,
    setSearchValue,
    searchValue,
    searchCallRTCPReport,
    searchQOSReport,
    searchLogReport,
    searchRtcReport,
    searchRemoteLog,
    searchQualityReport,
    searchBlacklist,
    searchGeoLoc,
    searchMetaDataRecording,
    loadNode,
    loadMappingProtocols,
    loadMappingFields,    
  };
};

export default SearchService;
