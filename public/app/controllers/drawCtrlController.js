    var injectDrawCtrlParams = ['$scope','$uibModalInstance'];
    
    var DrawCtrlController = function ($scope, $uibModalInstance) {

            console.log("OPEN DATA");

            $scope.ok = function() {
                $uibModalInstance.close("11");
            };

            $scope.close = function() {
                $uibModalInstance.dismiss('cancel');
            };

    };

    DrawCtrlController.$inject = injectDrawCtrlParams;
export default DrawCtrlController;
