
import 'angular';

import zenHome from './directives/home'


angular.module('bus-status',[zenHome])
    .controller('AppCtrl', [
        '$scope',
        function ($scope) {
            $scope.hai = 'bai';
        }
    ])
    .config(function($locationProvider) {
        $locationProvider.html5Mode(true);
    });