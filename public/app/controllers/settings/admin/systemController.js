    var injectParams = ['$scope','$state','$stateParams','$location','$rootScope','eventbus', 'settingsService', '$uibModal'];

    var SettingsAdminSystemController = function ($scope, $state, $stateParams, $location, $rootScope, eventbus, settingsService, $uibModal) {
         
            this.name = $stateParams.paramID;            
            $scope.SYSTEM_VERSION = HEPIC_VERSION;
    };

    SettingsAdminSystemController.$inject = injectParams;
export default SettingsAdminSystemController;
