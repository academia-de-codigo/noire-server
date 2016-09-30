'use strict';

var Hoek = require('hoek');
var Server = require('./server');
var Config = require('./config');

var internals = {};
internals.webPort = process.env.PORT || Config.ports.web;
internals.adminPort = process.env.ADMIN_PORT || Config.ports.admin;
internals.apiPort = process.env.API_PORT || Config.ports.api;

internals.manifest = {
    connections: [{
        port: internals.webPort,
        labels: ['web']
    }, {
        port: internals.adminPort,
        labels: ['admin'],
        tls: Config.tls
    }, {
        port: internals.apiPort,
        labels: ['api'],
        tls: Config.tls
    }],
    registrations: [{
        plugin: './views',
        options: {
            select: ['web', 'admin']
        }
    }, {
        plugin: './auth',
        options: {
            select: ['admin', 'api']
        }
    }, {
        plugin: './version',
        options: {
            select: ['api']
        }
    }, {
        plugin: './admin',
        options: {
            select: ['admin'],
            routes: {
                prefix: '/admin'
            }
        }
    }]
};

internals.composeOptions = {
    relativeTo: __dirname
};

Server.init(internals.manifest, internals.composeOptions, function(err, server) {

    Hoek.assert(!err, err);

    // Server connections
    var web = server.select('web');
    var admin = server.select('admin');
    var api = server.select('api');

    // Logging started servers
    console.log('Web server started at: ' + web.info.uri);
    console.log('Admin server started at: ' + admin.info.uri);
    console.log('Api server started at: ' + api.info.uri);

});
