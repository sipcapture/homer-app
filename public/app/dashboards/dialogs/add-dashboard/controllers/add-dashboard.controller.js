import angular from 'angular';

class AddDashboard {

  constructor($log, $scope, FileUploader) {
    'ngInject';
    this.FileUploader = FileUploader;
    this.$log = $log;
    this.$scope = $scope;
  }
  
  $onInit() {
    this.dashboard = {
      name: '',
      type: 'custom'
    };

    this.type_result = [{
      value: 'custom',
      name: 'Custom'
    }, {
      value: 'frame',
      name: 'Frame'
    }, {
      value: 'home',
      name: 'HOME'
    }, {
      value: 'search',
      name: 'SEARCH'
    }, {
      value: 'alarm',
      name: 'ALARM'
    }];

    this.uploader = new this.FileUploader({
      url: 'api/v1/dashboard/upload'
    });

    this.uploader.filters.push({
      name: 'customFilter',
      fn: function() {
        return this.queue.length < 1;
      }
    });

    this.uploader.onCompleteAll = function() {
      this.modalInstance.close('upload');
    };
  }

  close(dashboard) {
    this.modalInstance.close(dashboard);
  }

  dismiss() {
    this.modalInstance.dismiss('canceled');
  }

  hitEnter(evt) {
    if (angular.equals(evt.keyCode, 13) && !(angular.equals(this.dashboard, null) || angular.equals(this.dashboard, ''))) {
      this.save();
    }
  }

  save() {
    if (this.uploader.queue.length > 0) {
      this.uploader.uploadAll();
    } else {
      if (this.$scope.nameDialog.$valid) {
        this.close(this.dashboard);
      }
    }
  }

}

export default AddDashboard;
