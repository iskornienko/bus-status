

var requestHTTP = require('request');
const nanoURL = 'http://10.0.1.4:16021/api/v1/5s0v3UshF6r6m07xwdHQVgWhSh63yNk4/';

function getState(callback) {

    var config = {
        url: nanoURL+'state',
        method: 'GET',
        json: true
    };

    requestHTTP(config, function (error, rs, body) {
        callback(body)
    });
}

function setState(state,value, callback) {

    if(state == null && callback)
        callback();
    else if (state == null)
        return;

    var config = {
        url: nanoURL+'state',
        method: 'PUT',
        body : {},
        json: true
    };
    config.body[state] = {"value": value};

    requestHTTP(config, function (error, rs, body) {
        if(callback) callback();
    });
}

function setStateAtOnce(hue,sat,cl, callback) {

    var config = {
        url: nanoURL+'state',
        method: 'PUT',
        body : {},
        json: true
    };
    config.body['hue'] = {"value": hue};
    config.body['sat'] = {"value": sat};
    config.body['cl'] = {"value": cl};

    console.log(config)

    requestHTTP(config, function (error, rs, body) {
        if(callback) callback();
    });
}


function setHSL(hue, sat, ct, callback) {
    getState(
        function (state) {

            setState(state.hue.value != hue ? 'hue' : null, hue,
                function () {
                    setState(state.sat.value != sat ? 'sat' : null, sat,
                        function () {
                            var ct = Math.floor((6500-1200)*(ct/100)+1200);

                            setState(state.ct.value != ct ? 'ct' : null, ct,
                                function () {
                                    if(callback) callback();
                                });
                        });
                });
        }
    );
}

//setHSL(211, 43, 50)

//0 to 130
//setHSL(0, 70, 52);

//setStateAtOnce(30,70,52);



function transitionHue(from, to) {

    console.log(from, to);

    if(to >= from)
        return;

 setStateAtOnce(from,70,52,
        function () {
            console.log('in cb')
            setTimeout(function () {
                transitionHue(from-1, to);
            },10)

        })
}

transitionHue(100,0);





