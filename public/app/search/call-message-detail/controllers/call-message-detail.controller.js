const TransactionMessage = function($scope, $log, SearchService, $homerModal, $timeout, $sce, UserProfile) {
  'ngInject';

  const bindings = $scope.$parent.bindings;
  const data = bindings.params;

  const internal = bindings.internal;
  const custom = bindings.custom;

  const timezone = UserProfile.getProfile('timezone');
  $scope.dataLoading = true;
  $scope.showSipMessage = true;
  $scope.showSipDetails = false;
  $scope.msgOffset = timezone.offset;

  this.closeModal = function() {
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
    const sdata = bindings.sdata;
    $scope.dataLoading = false;

    const swapText = function(text) {
    
      let swpA;
      let swpB;
      text = text.split('<').join('&lt;');

      if (sdata.method != '') {
        swpA = sdata.method;
        swpB = '<font color=\'red\'><b>' + swpA + '</b></font>';
        text = text.split(swpA).join(swpB);
      }

      swpA = sdata.sid;
      swpB = '<font color=\'blue\'><b>' + swpA + '</b></font>';
      text = text.split(swpA).join(swpB);

      return $sce.trustAsHtml(text);
    };
    

    $scope.msgId = sdata.id;
    $scope.msgCallId = sdata.sid;
    $scope.msgDate = sdata.create_date;
    $scope.sipPath = sdata.srcIp + ':' + sdata.srcPort + ' -> ' + sdata.dstIp + ':' + sdata.dstPort;
    $scope.sipMessage = swapText(sdata.raw); // .replace(/</g, "&lt;");

    const tabjson = [];
    for (let p in sdata) {
      if (p == 'raw') continue;
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
    $scope.msgCallId = sdata.sid;
    $scope.msgDate = (sdata.create_date || sdata.report_ts || sdata.event_ts);
    $scope.sipPath = sdata.srcIp + ':' + sdata.srcPort + ' -> ' + sdata.dstIp + ':' + sdata.dstPort
    $scope.sipMessage = swapText(sdata.raw);

    let tabjson = [];
    for (let p in sdata) {
      if (p == 'raw') continue;
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
      const swapText = function(text) {
        let swpA;
        let swpB;
        text = text.split('<').join('&lt;');
        swpA = sdata[0].method;
        swpB = '<font color=\'red\'><b>' + swpA + '</b></font>';
        text = text.split(swpA).join(swpB);
        swpA = sdata[0].sid;
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
      $scope.msgCallId = sdata[0].sid;
      $scope.msgDate = sdata[0].create_date;
      $scope.sipPath = sdata[0].srcIp + ':' + sdata[0].srcPort + ' -> ' + sdata[0].dstPort + ':' + sdata[0].dstIp;
      
      $scope.sipMessage = swapText(sdata[0].raw); // .replace(/</g, "&lt;");

      const tabjson = [];
      for (let p in sdata[0]) {
        if (p == 'raw') continue;
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
