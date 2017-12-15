//import angular from 'angular';

//import app from '../app';

    /************************* editBoardDialogCtrl  **********************************/
    var injectMessengerParams = ['$scope', '$messagesService', 'eventbus', 'EVENTS'];
    var MessengerController = function ($scope, messagesService, eventbus, EVENTS) {

            $scope.Messages = messagesService;
            $scope.username = 'anonymous';

            $scope.submit = function(new_message) {
                if (!new_message) { return; }
                messagesService.send({
                    username: $scope.username,
                    message: new_message
                });
                        
                $scope.new_message = '';
            };
    };

    MessengerController.$inject = injectMessengerParams;
export default MessengerController;    
