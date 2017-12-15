    var injectNewWidgetDashboardParams = ['$scope', '$uibModalInstance', 'eventbus', 'EVENTS','data'];
    var NewWidgetDashboardController = function ($scope, $uibModalInstance, eventbus, EVENTS, data) {

        $scope.dashboard = {
            name: ""
        };
        
        $scope.widgets = {
            'Search': [
                    { name: 'quicksearch', title:'quicksearch', description: 'SIP Search Widgets'},
                    { name: 'hepsearch', title:'hepsearch', description: 'HEP Search Widgets'}
	     ],
            'Visualize': [
                    { name: 'sipcapture', title:'sipcapture', description: 'Core Charting Engine'},
                    { name: 'elasticchart', title:'elasticchart', description: 'Elasticsearch Charting Engine'},
                    { name: 'quickbox', title:'quickbox', description: 'Boxed Statistics'},
                    { name: 'quickhtml', title:'quickhtml', description: 'Boxed HTML'},
                    { name: 'clock', title:'clock', description: 'Programmable Clocks for Dashboards'}
            ],
        };
        
        $scope.addWidget = function(name) {
        
                //console.log("AZ", name);
                eventbus.broadcast(EVENTS.DASHBOARD_ADD_WIDGET, name);
                $uibModalInstance.dismiss("added");
        };

                                                                                                    
        $scope.close = function() {
            $uibModalInstance.dismiss("canceled");
        };
        $scope.hitEnter = function(evt) {
            if (angular.equals(evt.keyCode, 13) && !(angular.equals($scope.dashboard, null) || angular.equals($scope.dashboard, ""))) $scope.save();
        };

        $scope.save = function() {
                if ($scope.nameDialog.$valid) $uibModalInstance.close($scope.dashboard);
        };
    };

    NewWidgetDashboardController.$inject = injectNewWidgetDashboardParams;
export default NewWidgetDashboardController;
