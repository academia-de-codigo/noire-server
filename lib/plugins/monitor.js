'use strict';

var Good = require('good');
var Path = require('path');
var Hoek = require('hoek');
//TODO: make all log events go through chalk and paint red/green according to tags
//var Chalk = require('chalk');
var Package = require('../../package.json');
var Config = require('../config');

var internals = {};
internals.options = {
    ops: {
        interval: Config.monitor.interval
    },
    reporters: {}
};

internals.options.reporters.console = [{
    module: 'good-squeeze',
    name: 'Squeeze',
    args: [{
        log: {
            exclude: 'debug'
        }
    }]
}, {
    module: 'good-console',
    args: [{
        format: Config.monitor.format
    }]
}, 'stdout'];

//TODO: use rotating file stream
//https://github.com/hapijs/good/blob/master/examples/log-to-file.md

internals.options.reporters.ops = [{
    module: 'good-squeeze',
    name: 'Squeeze',
    args: [{
        ops: '*'
    }]
}, {
    module: 'good-squeeze',
    name: 'SafeJson'
}, {
    module: 'good-file',
    args: [Path.resolve(Config.monitor.path, Package.name + '-' + Package.version + '-ops.log')]
}];

internals.options.reporters.access = [{
    module: 'good-squeeze',
    name: 'Squeeze',
    args: [{
        response: '*'
    }]
}, {
    module: 'good-console',
    args: [{
        format: Config.monitor.format,
        color: false
    }]
}, {
    module: 'good-file',
    args: [Path.resolve(Config.monitor.path, Package.name + '-' + Package.version + '-access.log')]
}];

internals.options.reporters.ops = [{
    module: 'good-squeeze',
    name: 'Squeeze',
    args: [{
        log: {
            include: 'auth'
        }
    }]
}, {
    module: 'good-console',
    args: [{
        format: Config.monitor.format,
        color: false
    }]
}, {
    module: 'good-file',
    args: [Path.resolve(Config.monitor.path, Package.name + '-' + Package.version + '-auth.log')]
}];

internals.options.reporters.error = [{
    module: 'good-squeeze',
    name: 'Squeeze',
    args: [{
        log: {
            include: 'error'
        }
    }]
}, {
    module: 'good-console',
    args: [{
        format: Config.monitor.format,
        color: false
    }]
}, {
    module: 'good-file',
    args: [Path.resolve(Config.monitor.path, Package.name + '-' + Package.version + '-error.log')]
}];

exports.register = function(server, options, next) {

    // add route and access logs to console
    if (Config.monitor.debug) {
        internals.options.reporters.console[0].args[0] = {
            log: '*',
            response: '*',
            route: '*'
        };
    } else {
        internals.options.reporters.console[0].args[0] = {
            log: {
                exclude: ['debug', 'client']
            }
        };
    }

    //TODO: would be nice to color these like good-console does with response events
    server.on('route', function(event) {
        server.log(['server', 'route', 'debug'], {
            plugin: event.realm.plugin,
            method: event.method,
            path: event.path
        });
    });

    server.on('request', function(request, event) {

        var data = Hoek.clone(event.data);

        if (!data) {
            data = {};
        }

        if (typeof data === 'string') {
            data = {
                message: event.data
            };
        }

        Hoek.assert(typeof data === 'object', 'Incorrect usage of request.log()');

        data.payload = request.payload;
        data.params = request.params;
        event.tags.push('request');

        if (Config.monitor.debug) {

            // include the hapi request id, path and ip address
            data.request = event.request.split(':')[3];
            data.path = request.url.path;
            data.address = request.headers['x-forwarded-for'] || request.info.remoteAddress;

        }

        // make sure password does not show up in logs
        if (data.payload.password) {
            delete data.payload.password;
        }

        server.log(event.tags, data);

    });

    // Log all internal server errors to error log
    server.ext('onPreResponse', function(request, reply) {

        var response = request.response;
        if (response.isBoom && response.isServer) {
            request.log(['error'], response.data);
        }

        return reply.continue();
    });

    //TODO: would be nice to color these like good-console does with response events
    // log the payload for all api connection responses
    server.select('api').on('response', function(request) {

        if (!request.response.source) {
            return;
        }

        server.log(['response', 'debug'], request.response.source);

    });

    server.register({
        register: Good,
        options: internals.options
    }, function(err) {

        if (err) {
            return next(err);
        }

        return next();
    });
};

exports.register.attributes = {
    name: 'monitor',
    pkg: Package
};
