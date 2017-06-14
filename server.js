
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

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://127.0.0.1:27017/busstatus";

const BETWEEN_CALLS_IN_MS = 30000;

var requestedStops = ['2613', '1921'];
var requestedBusses = ['19'];

function getBusStatus() {

    requestHTTP({
        url: 'https://data.texas.gov/download/mqtr-wwpy/text%2Fplain',
        headers: {
            'User-Agent': 'request'
        }
    }, function (error, rs, body) {
        if (!error && rs.statusCode == 200) {
            console.log('called');

            var tripUpdate = JSON.parse(body);

            getCSVRowById("reference-data/routes.txt", requestedBusses,
                function (busses) {
                    getCSVRowById("reference-data/stops.txt", requestedStops,
                        function (stops) {

                            for (var x = 0; x < tripUpdate.entity.length; x++) {

                                var trip = tripUpdate.entity[x].trip_update;

                                for (var y = 0; y < trip.stop_time_update.length; y++) {

                                    var stopUpdate = trip.stop_time_update[y];

                                    if (requestedStops.indexOf(stopUpdate.stop_id) != -1
                                        && requestedBusses.indexOf(trip.trip.route_id) != -1) {

                                        var currentDate = (new Date()).getTime();

                                        var today = new Date();
                                        today.setHours(0);
                                        today.setMinutes(0);
                                        today.setSeconds(0);
                                        today.setMilliseconds(0);

                                        var millisecondsInDay = currentDate - today.getTime();


                                        MongoClient.connect(url, (function (err, db) {
                                            if (err) throw err;
                                            db.collection('bus_updates').insertOne(this.data);
                                            db.close();
                                        }).bind(
                                            {
                                                data:
                                                {
                                                    time: currentDate/1000,
                                                    secSinceDayStart: millisecondsInDay/1000,
                                                    dayOfWeek: (new Date()).getDay(),
                                                    timeToBusArrival: stopUpdate.arrival.time - currentDate/1000,
                                                    vehicle: trip.vehicle,
                                                    stopUpdate: stopUpdate,
                                                    trip: trip.trip,
                                                    routeName: busses[trip.trip.route_id][3],
                                                    stopName: stops[stopUpdate.stop_id][2]
                                                }
                                            }));

                                    }
                                }
                            }
                        })
                })

            setTimeout(function () {
                getBusStatus();
            }, BETWEEN_CALLS_IN_MS)
        }
    });
}

getBusStatus();


/*
app.get('/export', (request, response) => {
    MongoClient.connect(url, (function (err, db) {
        if (err) throw err;
        db.collection('bus_updates').find().limit(10000).toArray(function (err, result) {
            db.close();


            var b = '';
            result.forEach(function (a) {
                b += a.time+","+
                a.topUpdate.arrival.time*1000+","+
                a.topUpdate.stop_id+","+
                a.trip.route_id+","+
                a.trip.trip_id + '$$$';
            })


            console.log(b);


            response.send(b);
        })
    }))
})
*/

/*
app.get('/export123', (request, response) => {
    MongoClient.connect(url, (function (err, db) {
        if (err) throw err;

        db.collection('bus_updates').mapReduce(
            function () {emit(this.trip.trip_id,
                {time: this.timeToBusArrival,
                    arrival: this.secSinceDayStart/60/60});},
            function (key, values) {
                var minId = 23;
                var min = 100000000000;

                values.forEach(function (a) {
                    if(a.time < min) {
                        minId = a.arrival;
                        min = a.time;
                    }
                })

                return {
                    arrivalTime: minId,
                    estimateOff: min/60
                };
            },
            {
                query: {},
                out: 'totals'
            },
            function (err,result) {

            db.collection('totals').find(
                {}
            ).toArray(function(err,result) {
                db.close();
                response.send(result);
        })
    })
}))
})
*/


app.get('/stop/:stopIds/bus/:busIds', (request, response) => {
    MongoClient.connect(url, (function (err, db) {
        if (err) throw err;
        db.collection('bus_updates').find(
            {
                $and: [
                    { 'stopUpdate.stop_id' :  '2613'},
                    { 'trip.route_id' :  '19'},
                    { 'stopUpdate.arrival.time' : {$gt : (new Date ()).getTime()/1000}}
                ]
            }
        ).sort({timeToBusArrival:1}).limit(1).toArray(function(err,result) {
            db.collection('bus_updates').find(
                {
                    $and: [
                        { 'stopUpdate.stop_id' :  '1921'},
                        { 'trip.route_id' :  '19'},
                        { 'stopUpdate.arrival.time' : {$gt : (new Date ()).getTime()/1000}}
                    ]
                }
            ).sort({timeToBusArrival:1}).limit(1).toArray(function(err,result2) {

                db.close();

                console.log(request.params.stopIds)

                var requestedStops = request.params.stopIds != 'undefined' ? request.params.stopIds.split(',') : ['2613','1921'];
                var requestedBusses = request.params.busIds != 'undefined' ? request.params.busIds.split(',') : ['19'];

                var data = [];

                if(requestedStops.indexOf('2613') != -1)
                    data.push(result[0]);

                if(requestedStops.indexOf('1921') != -1)
                    data.push(result2[0]);

                console.log(requestedStops)

                response.send({data: data.map(function (a) {
                    return {
                        trip_id: a.trip.trip_id,
                        stop: a.stopUpdate.stop_id,
                        bus: a.trip.route_id,
                        time: a.stopUpdate.arrival.time*1000,
                        timeFromNow: (a.stopUpdate.arrival.time*1000 - (new Date()).getTime()),
                        routeName: a.routeName,
                        stopName: a.stopName
                    };
                })});
            })
        })

    }));
});

/*
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
*/

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