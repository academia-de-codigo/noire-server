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
        host: Config.connections.web.host,
        port: Config.connections.web.port,
        labels: ['web']
    }, {
        host: Config.connections.webTls.host,
        port: Config.connections.webTls.port,
        labels: ['web-tls'],
        tls: Config.tls
    }, {
        host: Config.connections.api.host,
        port: Config.connections.api.port,
        labels: ['api'],
        tls: Config.tls
    }],
    registrations: [{
        plugin: Path.resolve(internals.pluginsPath, 'views'),
        options: {
            select: ['web', 'web-tls']
        }
    }, {
        plugin: Path.resolve(internals.pluginsPath, 'auth'),
        options: {
            select: ['web', 'web-tls', 'api']
        }
    }, {
        plugin: Path.resolve(internals.pluginsPath, 'version'),
        options: {
            select: ['api'],
            routes: {
                prefix: Config.prefixes.api
            }
        }
    }, {
        plugin: Path.resolve(internals.pluginsPath, 'admin'),
        options: {
            select: ['web-tls'],
            routes: {
                prefix: Config.prefixes.admin
            }
        }
    }, {
        plugin: Path.resolve(internals.pluginsPath, 'redirect'),
        options: {
            select: ['web']
        }
    }]
};

Server.init(internals.manifest, internals.composeOptions, function(err, server) {

    Hoek.assert(!err, err);

    // Server connections
    var web = server.select('web');
    var webTls = server.select('web-tls');
    var api = server.select('api');

    // Logging started servers
    console.log('web server started at: ' + web.info.uri);
    console.log('web-tls server started at: ' + webTls.info.uri);
    console.log('api server started at: ' + api.info.uri);

});
