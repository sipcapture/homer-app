const TransactionMessage = function($scope, $log, SearchService, $homerModal, $timeout, $sce, UserProfile) {
  'ngInject';

  const bindings = $scope.$parent.bindings;
  var data = bindings.params;

  var internal = bindings.internal;
  var custom = bindings.custom;

  var timezone = UserProfile.getProfile('timezone');
  $scope.dataLoading = true;
  $scope.showSipMessage = true;
  $scope.showSipDetails = false;
  $scope.msgOffset = timezone.offset;

  this.closeModal = function () {
    $scope.$parent.closeModal();
  };

  $scope.protoCheck = function(proto) {
    if (parseInt(proto) == 17) return 'udp';
    else if (parseInt(proto) == 8) return 'tcp';
    else if (parseInt(proto) == 3) return 'wss';
    else if (parseInt(proto) == 4) return 'sctp';
    else return 'udp';
  };

  $scope.clickSipDetails = function() {
    console.log('details');
  };

  if (internal) {
    var sdata = bindings.sdata;
    $scope.dataLoading = false;

    var swapText = function(text) {
      var swpA, swpB;
      text = text.split('<').join('&lt;');

      if (sdata.method != '') {
        swpA = sdata.method;
        swpB = '<font color=\'red\'><b>' + swpA + '</b></font>';
        text = text.split(swpA).join(swpB);
      }

      swpA = sdata.callid;
      swpB = '<font color=\'blue\'><b>' + swpA + '</b></font>';
      text = text.split(swpA).join(swpB);

      return $sce.trustAsHtml(text);
    };

    $scope.msgId = sdata.id;
    $scope.msgCallId = sdata.callid;
    $scope.msgDate = sdata.micro_ts / 1000;
    $scope.sipPath = sdata.source_ip + ':' + sdata.source_port + ' -> ' + sdata.destination_ip + ':' + sdata.destination_port;
    $scope.sipMessage = swapText(sdata.message); //.replace(/</g, "&lt;");

    var tabjson = [];
    for (var p in sdata) {
      if (p == 'message') continue;
      if (sdata.hasOwnProperty(p) && sdata[p] != '') {
        if (typeof sdata[p] === 'string' || sdata[p] instanceof String) {
          tabjson.push('<tr><td>' + p + '' + '</td><td>' + sdata[p].split('<').join('&lt;') + '</td></tr>');
        } else {
          if (p == '$$hashKey') return;
          if (p == 'proto') sdata[p] = $scope.protoCheck(sdata[p]);
          tabjson.push('<tr><td>' + p + '' + '</td><td>' + sdata[p] + '</td></tr>');
        }
      }
    }
    tabjson.push();
    $scope.sipDetails = '<div id="' + sdata.id + '_details"><table class="table table-striped">' + tabjson.join('') + '</table></div>';
    $scope.trustedHtmlDetails = $sce.trustAsHtml($scope.sipDetails);

  } else if (custom) {
    let sdata = bindings.sdata;
    $scope.dataLoading = false;
    let swapText = function(text) {
      try {
        text = JSON.stringify(JSON.parse(text), null, 4);
      } catch (e) {
        $log.error(e);
      }
      return $sce.trustAsHtml(text);
    };

    $scope.msgId = sdata.id;
    $scope.msgCallId = sdata.callid;
    $scope.msgDate = (sdata.micro_ts || sdata.report_ts || sdata.event_ts) / 1000;
    $scope.sipPath = sdata.source_ip + ':' + sdata.source_port + ' -> ' + sdata.destination_ip + ':' + sdata.destination_port;
    $scope.sipMessage = swapText(sdata.message);

    let tabjson = [];
    for (let p in sdata) {
      if (p == 'message') continue;
      if (sdata.hasOwnProperty(p) && sdata[p] != '') {
        if (typeof sdata[p] === 'string' || sdata[p] instanceof String) {
          tabjson.push('<tr><td>' + p + '' + '</td><td>' + sdata[p].split('<').join('&lt;') + '</td></tr>');
        } else {
          if (p == '$$hashKey') return;
          if (p == 'proto') sdata[p] = $scope.protoCheck(sdata[p]);
          tabjson.push('<tr><td>' + p + '' + '</td><td>' + sdata[p] + '</td></tr>');
        }
      }
    }
    tabjson.push();
    $scope.sipDetails = '<div id="' + sdata.id + '_details"><table class="table table-striped">' + tabjson.join('') + '</table></div>';
    $scope.trustedHtmlDetails = $sce.trustAsHtml($scope.sipDetails);
  } else {

    SearchService.searchCallMessage(data).then(function(sdata) {
      var swapText = function(text) {
        var swpA, swpB;
        text = text.split('<').join('&lt;');
        swpA = sdata[0].method;
        swpB = '<font color=\'red\'><b>' + swpA + '</b></font>';
        text = text.split(swpA).join(swpB);
        swpA = sdata[0].callid;
        swpB = '<font color=\'blue\'><b>' + swpA + '</b></font>';
        text = text.split(swpA).join(swpB);

        swpA = sdata[0].from_tag;
        swpB = '<font color=\'red\'><b>' + swpA + '</b></font>';
        text = text.split(swpA).join(swpB);

        swpA = sdata[0].via_1_branch;
        swpB = '<font color=\'green\'><b>' + swpA + '</b></font>';
        text = text.split(swpA).join(swpB);
        return $sce.trustAsHtml(text);
      };

      $scope.showMessageById = function(id, event) {
        console.log('Internal showMessageById');
        $scope.$parent.showMessageById(id, event);
      };

      $scope.msgId = sdata[0].id;
      $scope.msgCallId = sdata[0].callid;
      $scope.msgDate = sdata[0].micro_ts / 1000;
      $scope.sipPath = sdata[0].source_ip + ':' + sdata[0].source_port + ' -> ' + sdata[0].destination_ip + ':' + sdata[0].destination_port;
      $scope.sipMessage = swapText(sdata[0].msg); //.replace(/</g, "&lt;");

      var tabjson = [];
      for (var p in sdata[0]) {
        if (p == 'msg') continue;
        if (sdata[0].hasOwnProperty(p) && sdata[0][p] != '') {
          tabjson.push('<tr><td>' + p + '' + '</td><td>' + sdata[0][p].split('<').join('&lt;') + '</td></tr>');
        }
      }
      tabjson.push();
      $scope.sipDetails = '<div id="' + sdata[0].id + '_details"><table class="table table-striped">' + tabjson.join('') + '</table></div>';
      $scope.trustedHtmlDetails = $sce.trustAsHtml($scope.sipDetails);
    }).catch(function(error) {
      $log.error('[TransactionMessage]', error);
    }).finally(function() {
      $scope.dataLoading = false;
    });

    $timeout(function() {
      if ($homerModal.getOpenedModals().indexOf('tempModal') !== -1) {
        $homerModal.close('tempModal', 'var a', 'var b');
      }
    }, 5000);
  }
};

export default TransactionMessage;
