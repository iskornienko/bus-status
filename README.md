# Austin, TX Custom Bus Status

### Motivation
I sometimes take a bus to work. Austins bus app is tedious to use and time consuming to check if buses are running on time. This simple bus app helps me understand when to expect the next bus on my route.

### Current State
I no longer take the bus to work thus don't use this anymore.

![Bus App Screenshot](https://github.com/iskornienko/bus-status/blob/master/sample-image.png?raw=true )

### Overview
* All front end source code is in /ui/src
* All back end source code is in server.js
  * Update requestedStops to change tracked stops
  * Update requestedBusses to change tracked busses
  * Update url to change the Mongo DB repo

### Setup
`npm install`

`npm run webpack-dev`

`webpack --production`

`node ./server.js`
