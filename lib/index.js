'use strict';

var Hoek = require('hoek');
var Server = require('./server');

var internals = {};

internals.port = process.env.PORT || 8000;

Server.init(internals.port, function(err, server) {

    Hoek.assert(!err, err);
    console.log('Server started at: ' + server.info.uri);
});
