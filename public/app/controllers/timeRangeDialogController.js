    var injectTimeParams = ['$log', '$scope', '$uibModalInstance', 'data'];

    var TimeRangeDialogController = function ($log, $scope, $uibModalInstance, data) {
        $scope.timerange = data;
        $scope.options = {
            hstep: [ 1, 2, 3 ],
            mstep: [ 1, 5, 10, 15, 25, 30 ],
            sstep: [ 1, 5, 10, 15, 25, 30 ]
        };
        $scope.$watch("timerange.from", function(val, old) {
            $log.info("Date Changed: " + val);
            $scope.opened = false;
        });
        $scope.setDate = function() {
            if (!angular.isDefined($scope.timerange.from)) $scope.timerange.from = new Date();
            if (!angular.isDefined($scope.timerange.to)) $scope.timerange.to = new Date();
        };
        $scope.setDate();
        $scope.done = function() {
            $uibModalInstance.close($scope.timerange);
        };
        

        
    };

    TimeRangeDialogController.$inject = injectTimeParams;
export default TimeRangeDialogController;
