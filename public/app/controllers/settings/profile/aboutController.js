    var injectParams = ['$scope','$state','$stateParams','$location','$rootScope','eventbus', 'settingsService', '$uibModal'];

    var SettingsAboutController = function ($scope, $state, $stateParams, $location, $rootScope, eventbus, settingsService, $uibModal) {
         
            this.name = $stateParams.paramID;            
    };

    SettingsAboutController.$inject = injectParams;
export default SettingsAboutController;
