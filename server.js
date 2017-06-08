
var requestHTTP = require('request');
const https = require('https')
const path = require('path')
const express = require('express')
const app = express()
const port = 5000;

var csv = require("fast-csv");
var fs = require("fs");

var server = require('http').createServer(app);

app.use(express.static('ui'));


app.get('/stop/:stopIds/bus/:busIds', (request, response) => {


    requestHTTP({
        url: 'https://data.texas.gov/download/mqtr-wwpy/text%2Fplain',
        headers: {
            'User-Agent': 'request'
        }
    }, function (error, rs, body) {
        if (!error && rs.statusCode == 200) {

            var tripUpdate = JSON.parse(body);

            var requestedStops = request.params.stopIds.split(',');
            var requestedBusses = request.params.busIds.split(',');



            getCSVRowById("reference-data/routes.txt", requestedBusses,
                function (busses) {
                    getCSVRowById("reference-data/stops.txt", requestedStops,
                        function (stops) {

                            var busStatuses = [];

                            for(var x = 0; x < tripUpdate.entity.length; x++) {

                                var trip = tripUpdate.entity[x].trip_update;

                                for(var y = 0; y <trip.stop_time_update.length; y++) {

                                    var stopUpdate = trip.stop_time_update[y];

                                    if(requestedStops.indexOf(stopUpdate.stop_id) != -1
                                        && requestedBusses.indexOf(trip.trip.route_id) != -1) {

                                    //    console.log('THIS',busses, stops)

                                        busStatuses.push({
                                            stop: stopUpdate.stop_id,
                                            bus: trip.trip.route_id,
                                            time: stopUpdate.arrival.time*1000,
                                            timeFromNow: (stopUpdate.arrival.time*1000 - (new Date()).getTime()),
                                            routeName: busses[trip.trip.route_id][3],
                                            stopName: stops[stopUpdate.stop_id][2]
                                        })
                                    }
                                }
                            }


                            response.send({
                                stopIds:request.params.stopIds,
                                busIds: request.params.busIds,
                                data: busStatuses
                            })
                        })
                })



        }
    })


});


function getCSVRowById(doc,id,callback) {
    var stream = fs.createReadStream(doc);

    var matchingRows = [];


    csv
        .fromStream(stream)
        .on("data", function(data){

            if(id.indexOf(data[0]+'') != -1) {
                matchingRows[data[0]+''] = data;
            }
        })
        .on("end", function() {
            callback(matchingRows);
        });
}


server.listen(port);