'use strict';

var Hoek = require('hoek');
var Path = require('path');
var Manager = require('./manager');
var Config = require('./config');

var internals = {
    pluginsPath: Path.resolve(__dirname, 'plugins')
};

internals.composeOptions = {
    relativeTo: __dirname
};

internals.manifest = {};
internals.manifest.connections = [{
    host: Config.connections.web.host,
    port: Config.connections.web.port,
    labels: ['web'],
    routes: {
        files: {
            relativeTo: Path.join(__dirname, '../assets')
        }
    }
}, {
    host: Config.connections.webTls.host,
    port: Config.connections.webTls.port,
    labels: ['web-tls'],
    tls: Config.tls,
    routes: {
        files: {
            relativeTo: Path.join(__dirname, '../assets')
        }
    }
}, {
    host: Config.connections.api.host,
    port: Config.connections.api.port,
    labels: ['api'],
    tls: Config.tls
}];

internals.manifest.registrations = [{
    plugin: Path.resolve(internals.pluginsPath, 'monitor'),
    options: {
        select: ['web', 'web-tls', 'api']
    }
}, {
    plugin: Path.resolve(internals.pluginsPath, 'db'),
}, {
    plugin: Path.resolve(internals.pluginsPath, 'docs'),
    // Need plugin to be enabled on all connections due to:
    // https://github.com/hapijs/discuss/issues/394
    /* options: {
        select: ['api']
    }*/
}, {
    plugin: Path.resolve(internals.pluginsPath, 'routes'),
    options: {
        select: ['web', 'web-tls']
    }
}, {
    plugin: Path.resolve(internals.pluginsPath, 'assets'),
    options: {
        select: ['web', 'web-tls']
    }
}, {
    plugin: Path.resolve(internals.pluginsPath, 'auth'),
    options: {
        select: ['web', 'web-tls', 'api']
    }
}, {
    plugin: Path.resolve(internals.pluginsPath, 'login'),
    options: {
        select: ['web-tls'] // no clear text credentials on the wire!
    }
}, {
    plugin: Path.resolve(internals.pluginsPath, 'api'),
    options: {
        select: ['api'],
        routes: {
            prefix: Config.prefixes.api
        }
    }
}, {
    plugin: Path.resolve(internals.pluginsPath, 'redirect'),
    options: {
        select: ['web', 'web-tls']
    }
}, {
    plugin: Path.resolve(internals.pluginsPath, 'errors'),
    options: {
        select: ['web', 'web-tls']
    }
}, {
    plugin: Path.resolve(internals.pluginsPath, 'csrf'),
    options: {
        select: ['web', 'web-tls'] // api uses stateless auth (no cookies) and does not require csrf protection
    }
}, {
    plugin: {
        register: Path.resolve(internals.pluginsPath, 'repository'),
        options: {
            models: ['user', 'role']
        }
    }
}];

Manager.start(internals.manifest, internals.composeOptions, function(err, server) {

    Hoek.assert(!err, err);

    // Server connections
    var web = server.select('web');
    var webTls = server.select('web-tls');
    var api = server.select('api');

    // Logging started servers
    // TODO: would like to catch server start events in monitor plugin, doc says:
    // event.server - if the event relates to a server, the server.info.uri
    // but that does not seem to be the case.. open issue perhaps?
    server.log(['server', 'web', 'start'], web.info.uri);
    server.log(['server', 'web-tls', 'start'], webTls.info.uri);
    server.log(['server', 'api', 'start'], api.info.uri);

    // Logging stopped servers
    server.ext('onPreStop', function(server, next) {
        server.log(['server', 'stop']);
        return next();
    });

});
