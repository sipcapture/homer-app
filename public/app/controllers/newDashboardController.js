    var injectNewDashboardParams = ['$scope', '$uibModalInstance', 'data', 'FileUploader'];
    var NewDashboardController = function ($scope, $uibModalInstance, data, FileUploader) {

        $scope.dashboard = {
            name: ""
        };
        
        $scope.type_result = [
            { value:'custom', name:'Custom'},
            { value:'frame', name:'Frame'},
            { value:'home', name:'HOME'},   
            { value:'search', name:'SEARCH'},
            { value:'alarm', name:'ALARM'}
        ];
                                                                                                    
        $scope.cancel = function() {
            $uibModalInstance.dismiss("canceled");
        };
        $scope.hitEnter = function(evt) {
            if (angular.equals(evt.keyCode, 13) && !(angular.equals($scope.dashboard, null) || angular.equals($scope.dashboard, ""))) $scope.save();
        };
        var uploader = $scope.uploader = new FileUploader({
            url: "api/v1/dashboard/upload"
        });
        $scope.save = function() {
            if ($scope.uploader.queue.length > 0) {
                uploader.uploadAll();
            } else {
                if ($scope.nameDialog.$valid) $uibModalInstance.close($scope.dashboard);
            }
        };
        uploader.filters.push({
            name: "customFilter",
            fn: function(item, options) {
                return this.queue.length < 1;
            }
        });
        uploader.onCompleteAll = function() {
            console.info("onCompleteAll");
            $uibModalInstance.close("upload");
        };

    };

    NewDashboardController.$inject = injectNewDashboardParams;
export default NewDashboardController;
