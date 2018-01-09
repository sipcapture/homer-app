var SearchService = function($q, $http, UserProfile, API) {
  'ngInject';

  UserProfile.getAllServerRemoteProfile();

  var searchValue = {};

  var timerange = {
    fromdate: new Date(new Date().getTime() - 300 * 1000),
    todate: new Date()
  };

  /* actual search data */
  var searchdata = {
    timestamp: {
      from: new Date(new Date().getTime() - 300 * 1000),
      to: new Date()
    },
    param: {
      transaction: {
        call: true,
        registration: true,
        rest: true
      },
      limit: 200
    }
  };

  var setTimeRange = function(data) {
    timerange = data;
  };

  var getTimeRange = function() {
    return timerange;
  };

  var setSearchData = function(data) {
    searchdata = data;
  };

  var getSearchData = function() {
    return searchdata;
  };

  var setSearchValue = function(data) {
    searchValue = data;
  };

  var getSearchValue = function() {
    return searchValue;
  };

  /**** CALL **/

  var searchCallByParam = function(mdata) {

    var defer = $q.defer();

    $http.post(API.SEARCH.CALL.DATA, mdata, {
      handleStatus: [403, 503]
    }).then(
      /* good response */
      function(results) {
        defer.resolve(results.data);
      },
      /* bad response */
      function() {
        defer.reject('bad response combination');
      }
    );

    return defer.promise;
  };



  var searchMethod = function(data) {

    var defer = $q.defer();

    $http.post(API.SEARCH.METHOD, data, {
      handleStatus: [403, 503]
    }).then(
      /* good response */
      function(results) {
        defer.resolve(results.data);
      },
      /* bad response */
      function() {
        defer.reject('bad response combination');
      }
    );

    return defer.promise;
  };

  var searchCallMessage = function(data) {

    var defer = $q.defer();

    $http.post(API.SEARCH.CALL.MESSAGE, data, {
      handleStatus: [403, 503]
    }).then(
      /* good response */
      function(results) {
        defer.resolve(results.data);
      },
      /* bad response */
      function() {
        defer.reject('bad response combination');
      }
    );

    return defer.promise;
  };

  var searchCallByTransaction = function(data) {

    var defer = $q.defer();

    $http.post(API.CALL.TRANSACTION, data, {
      handleStatus: [403, 503]
    }).then(
      /* good response */
      function(results) {
        defer.resolve(results.data);
      },
      /* bad response */
      function() {
        defer.reject('bad response combination');
      }
    );

    return defer.promise;
  };

  /***** registration ***/

  var searchRegistrationByParam = function(mdata) {

    var defer = $q.defer();

    $http.post(API.SEARCH.REGISTRATION.DATA, mdata, {
      handleStatus: [403, 503]
    }).then(
      /* good response */
      function(results) {
        defer.resolve(results.data);
      },
      /* bad response */
      function() {
        defer.reject('bad response combination');
      }
    );

    return defer.promise;
  };

  var searchRegistrationMessage = function(data) {

    var defer = $q.defer();

    $http.post(API.SEARCH.REGISTRATION.MESSAGE, data, {
      handleStatus: [403, 503]
    }).then(
      /* good response */
      function(results) {
        defer.resolve(results.data);
      },
      /* bad response */
      function() {
        defer.reject('bad response combination');
      }
    );

    return defer.promise;
  };

  var searchRegistrationByTransaction = function(data) {

    var defer = $q.defer();

    $http.post(API.REGISTRATION.TRANSACTION, data, {
      handleStatus: [403, 503]
    }).then(
      /* good response */
      function(results) {
        defer.resolve(results.data);
      },
      /* bad response */
      function() {
        defer.reject('bad response combination');
      }
    );

    return defer.promise;
  };

  /***** proto ***/

  var searchProtoByParam = function(mdata) {

    var defer = $q.defer();

    $http.post(API.SEARCH.PROTO.DATA, mdata, {
      handleStatus: [403, 503]
    }).then(
      /* good response */
      function(results) {
        defer.resolve(results.data);
      },
      /* bad response */
      function() {
        defer.reject('bad response combination');
      }
    );

    return defer.promise;
  };

  var searchProtoMessage = function(data) {

    var defer = $q.defer();

    $http.post(API.SEARCH.PROTO.MESSAGE, data, {
      handleStatus: [403, 503]
    }).then(
      /* good response */
      function(results) {
        defer.resolve(results.data);
      },
      /* bad response */
      function() {
        defer.reject('bad response combination');
      }
    );

    return defer.promise;
  };

  var searchProtoByTransaction = function(data) {

    var defer = $q.defer();

    $http.post(API.PROTO.TRANSACTION, data, {
      handleStatus: [403, 503]
    }).then(
      /* good response */
      function(results) {
        defer.resolve(results.data);
      },
      /* bad response */
      function() {
        defer.reject('bad response combination');
      }
    );

    return defer.promise;
  };


  /**** REPORT ***/
  var searchCallRTCPReport = function(data) {

    var defer = $q.defer();

    $http.post(API.CALL.REPORT.RTCP, data, {
      handleStatus: [403, 503]
    }).then(
      /* good response */
      function(results) {
        defer.resolve(results.data);
      },
      /* bad response */
      function() {
        defer.reject('bad response combination');
      }
    );

    return defer.promise;
  };

  var searchQOSReport = function(data) {

    var defer = $q.defer();

    $http.post(API.CALL.REPORT.QOS, data, {
      handleStatus: [403, 503]
    }).then(
      /* good response */
      function(results) {
        defer.resolve(results.data);
      },
      /* bad response */
      function() {
        defer.reject('bad response combination');
      }
    );

    return defer.promise;
  };

  var searchLogReport = function(data) {

    var defer = $q.defer();

    $http.post(API.CALL.REPORT.LOG, data, {
      handleStatus: [403, 503]
    }).then(
      /* good response */
      function(results) {
        defer.resolve(results.data);
      },
      /* bad response */
      function() {
        defer.reject('bad response combination');
      }
    );

    return defer.promise;
  };

  var searchRecordingReport = function(data) {

    var defer = $q.defer();

    $http.post(API.CALL.RECORDING.DATA, data, {
      handleStatus: [403, 503]
    }).then(
      /* good response */
      function(results) {
        defer.resolve(results.data);
      },
      /* bad response */
      function() {
        defer.reject('bad response combination');
      }
    );

    return defer.promise;
  };

  var searchRtcReport = function(data) {

    var defer = $q.defer();

    $http.post(API.CALL.REPORT.RTC, data, {
      handleStatus: [403, 503]
    }).then(
      /* good response */
      function(results) {
        defer.resolve(results.data);
      },
      /* bad response */
      function() {
        defer.reject('bad response combination');
      }
    );

    return defer.promise;
  };

  var searchRemoteLog = function(data) {

    var defer = $q.defer();

    $http.post(API.CALL.REPORT.REMOTELOG, data, {
      handleStatus: [403, 503]
    }).then(
      /* good response */
      function(results) {
        defer.resolve(results.data);
      },
      /* bad response */
      function() {
        defer.reject('bad response combination');
      }
    );

    return defer.promise;
  };

  var searchQualityReport = function(type, data) {

    var defer = $q.defer();

    $http.post(API.CALL.REPORT.QUALITY+'/'+type, data, {
      handleStatus: [403, 503]
    }).then(
      /* good response */
      function(results) {
        defer.resolve(results.data);
      },
      /* bad response */
      function() {
        defer.reject('bad response combination');
      }
    );

    return defer.promise;
  };


  var loadNode = function() {

    var defer = $q.defer();

    $http.get(API.DASHBOARD.NODE, {
      handleStatus: [403, 503]
    }).then(
      /* good response */
      function(results) {
        defer.resolve(results.data);
      },
      /* bad response */
      function() {
        defer.reject('bad response combination');
      }
    );

    return defer.promise;
  };

  var makePcapTextforTransaction = function(data, type, trans) {

    var defer = $q.defer();

    var url = API.EXPORT.CALL.MESSAGES+'/';
    if (trans == 'registration') url = API.EXPORT.REGISTRATION.MESSAGES+'/';
    else if (trans == 'proto') url = API.EXPORT.PROTO.MESSAGES+'/';

    var response = {
      responseType: 'arraybuffer',
      handleStatus: [403, 503]
    };
    if (type == 1) url += 'text';
    else if (type == 2) {
      url += 'cloud';
      response = {
        handleStatus: [403, 503]
      };
    } else url += 'pcap';

    console.log(response);

    $http.post(url, data, response).then(
      /* good response */
      function(results) {
        defer.resolve(results.data);
      },
      /* bad response */
      function() {
        defer.reject('bad response combination');
      }
    );

    return defer.promise;
  };

  var makeReportRequest = function(data) {

    var defer = $q.defer();

    var url = API.EXPORT.CALL.TRANSACTION.HTML;

    var response = {
      responseType: 'arraybuffer',
      handleStatus: [403, 503]
    };

    console.log(response);

    $http.post(url, data, response).then(
      /* good response */
      function(results) {
        defer.resolve(results.data);
      },
      /* bad response */
      function() {
        defer.reject('bad response combination');
      }
    );

    return defer.promise;
  };


  var downloadRecordingPcap = function(id, type) {

    var defer = $q.defer();

    var url = API.CALL.RECORDING.DOWNLOAD+'/'+type+'/'+id;

    var response = {
      responseType: 'arraybuffer',
      handleStatus: [403, 503]
    };

    $http.get(url, response).then(
      /* good response */
      function(results) {
        defer.resolve(results.data);
      },
      /* bad response */
      function() {
        defer.reject('bad response combination');
      }
    );

    return defer.promise;
  };




  var makePcapTextData = function(data, type) {


    var defer = $q.defer();

    var response = {
      responseType: 'arraybuffer',
      handleStatus: [403, 503]
    };
    var url = API.SEARCH.CALL.EXPORT.DATA+'/';
    if (type == 1) url += 'text';
    else if (type == 2) {
      url += 'cloud';
      response = {
        handleStatus: [403, 503]
      };
    } else if (type == 3) {
      url += 'count';
      response = {
        handleStatus: [403, 503]
      };
    } else url += 'pcap';

    $http.post(url, data, response).then(
      /* good response */
      function(results) {
        defer.resolve(results.data);
      },
      /* bad response */
      function() {
        defer.reject('bad response combination');
      }
    );

    return defer.promise;
  };

  var searchBlacklist = function(ip) {

    var defer = $q.defer();

    var profile = UserProfile.getServerProfile('dashboard');
    if (profile.blacklist && profile.blacklist_url) {

      $http.get(profile.blacklist_url + ip + '/events', {
        handleStatus: [403, 503]
      }).then(
        /* good response */
        function(results) {
          if (!results || !results.data || results.data.count < 1) {
            defer.reject('request failed');
          } else {
            results.data.ip = ip;
            defer.resolve(results.data);
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

  var searchGeoLoc = function(ip) {

    var profile = UserProfile.getServerProfile('dashboard');

    var defer = $q.defer();

    if (profile.geolookup && profile.geolookup_url) {

      $http.get(profile.geolookup_url + ip, {
        handleStatus: [403, 503],
        async: true
      }).then(
        /* good response */
        function(results) {
          if (!results || !results.data) {
            defer.reject('request failed');
          } else {
            // console.log('GEO-LOOKUP',ip,results);
            defer.resolve(results.data);
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

  ///* CUSTOM API, EXPERIMENTAL */
  //var searchCustom = function(data, api) {

  //  var profile = UserProfile.getServerProfile('dashboard');
  //  var defer = $q.defer();
  //  var apiurl = api;
  //  if (profile.customapi_url) {
  //    apiurl = profile.customapi_url;
  //  }
  //  if (!apiurl || 0 === apiurl.length) return;
  //  if (profile.customapi) {

  //    $http.get(apiurl + data, {
  //      handleStatus: [403, 503],
  //      async: true
  //    }).then(
  //      /* good response */
  //      function(results) {
  //        if (!results || !results.data) {
  //          defer.reject('request failed');
  //        } else {
  //          // console.log('GEO-LOOKUP',ip,results);
  //          defer.resolve(results.data);
  //        }
  //      },
  //      /* bad response */
  //      function() {
  //        defer.reject('bad response combination');
  //      }
  //    );
  //  } else {
  //    defer.reject('bad response combination');
  //  }

  //  return defer.promise;
  //};


  var createShareLink = function(data) {

    var defer = $q.defer();

    $http.post(API.SHARE.LINK, data, {
      handleStatus: [403, 503]
    }).then(
      /* good response */
      function(results) {
        defer.resolve(results.data);
      },
      /* bad response */
      function() {
        defer.reject('bad response combination');
      }
    );

    return defer.promise;
  };

  var searchMetaDataRecording = function(id) {

    var defer = $q.defer();

    $http.get(API.CALL.RECORDING.INFO+'/'+id, {
      handleStatus: [403, 503]
    }).then(
      /* good response */
      function(results) {
        defer.resolve(results.data);
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
    searchRecordingReport,
    searchRtcReport,
    searchRemoteLog,
    searchQualityReport,
    searchBlacklist,
    searchGeoLoc,
    searchMetaDataRecording,
    loadNode
  };
};

export default SearchService;
