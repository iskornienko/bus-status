import 'angular';

import "./style.less";

let app = angular.module('bus-status-home',[])
    .directive('busStatusHome',[
        function () {
            return {
                restrict:"AE",
                replace:true,
                scope:{},
                template:require('./template.html'),
                controller: [
                    '$scope', '$http','$location',
                    function ($scope, $http, $location) {

                        console.log($location.search().stop)
                        console.log($location.search().bus)

                        $http.get('/stop/'+$location.search().stop+'/bus/'+$location.search().bus).then(function (out) {

                            $scope.busses = out.data.data;
                            console.log(out.data.data);

                        });


                        $scope.printTimeElapsed = function(seconds, shorten) {

                            var printTime = "";

                            var min = seconds/60;
                            var hour = seconds/60/60;
                            var day = seconds/60/60/24;

                            if(seconds < 60) {
                                printTime = seconds+'s';
                            } else if (min < 60) {
                                printTime = Math.floor(min)+'m';

                                if(!shorten) {
                                    printTime += ' '+Math.floor((seconds-Math.floor(min)*60))+'s';
                                }
                            } else if (hour < 24) {
                                printTime = Math.floor(hour)+"h";

                                if(!shorten) {
                                    printTime += ' '+Math.floor((min-Math.floor(hour)*60))+'m';
                                }
                            } else {
                                printTime = Math.floor(day)+"d";

                                if(!shorten) {
                                    printTime += ' '+Math.floor((hour-Math.floor(day)*24))+'h';
                                }
                            }

                            return printTime;
                        }


                    }

                ]
        }}
    ])


export default app.name;