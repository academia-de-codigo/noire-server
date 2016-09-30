'use strict';

var Hoek = require('hoek');
var Path = require('path');
var Server = require('./server');
var Config = require('./config');

var internals = {
    pluginsPath: Path.resolve(__dirname, 'plugins')
};

internals.composeOptions = {
    relativeTo: __dirname
};

internals.manifest = {
    connections: [{
        host: Config.servers.web.host,
        port: Config.servers.web.port,
        labels: ['web']
    }, {
        host: Config.servers.admin.host,
        port: Config.servers.admin.port,
        labels: ['admin'],
        tls: Config.tls
    }, {
        host: Config.servers.api.host,
        port: Config.servers.api.port,
        labels: ['api'],
        tls: Config.tls
    }],
    registrations: [{
        plugin: Path.resolve(internals.pluginsPath, 'views'),
        options: {
            select: ['web', 'admin']
        }
    }, {
        plugin: Path.resolve(internals.pluginsPath, 'auth'),
        options: {
            select: ['admin', 'api']
        }
    }, {
        plugin: Path.resolve(internals.pluginsPath, 'version'),
        options: {
            select: ['api'],
            routes: {
                prefix: '/api'
            }
        }
    }, {
        plugin: Path.resolve(internals.pluginsPath, 'admin'),
        options: {
            select: ['admin'],
            routes: {
                prefix: '/admin'
            }
        }
    }]
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
