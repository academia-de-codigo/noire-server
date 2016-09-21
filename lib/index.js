'use strict';

var Hoek = require('hoek');
var Server = require('./server');

var internals = {};
internals.port = process.env.PORT || 8000;

internals.manifest = {
    connections: [{
        port: internals.port
    }],
    registrations: [{
        plugin: './views'
    }, {
        plugin: './auth'
    }, {
        plugin: './version'
    }, {
        plugin: './admin'
    }]
};

internals.composeOptions = {
    relativeTo: __dirname
};

Server.init(internals.manifest, internals.composeOptions, function(err, server) {

    Hoek.assert(!err, err);
    console.log('Server started at: ' + server.info.uri);
});
