'use strict';

var Url = require('url');
var Package = require('../../package.json');
var Config = require('../config');

var internals = {
    loginUrl: {
        protocol: 'https',
        slashes: true,
        hostname: Config.connections.webTls.host,
        port: Config.connections.webTls.port
    },
    restrictedUrl: {
        protocol: 'https',
        slashes: true,
        hostname: Config.connections.webTls.host,
        port: Config.connections.webTls.port
    },
    apiUrl: {
        protocol: 'https',
        slashes: true,
        hostname: Config.connections.api.host,
        port: Config.connections.api.port
    }
};

exports.register = function(server, options, next) {

    server.ext('onRequest', function(request, reply) {

        if (request.url.path === '/login') {
            return reply.redirect(Url.format(internals.loginUrl) + request.url.path).permanent();
        }

        reply.continue();

    });

    server.route({
        path: Config.prefixes.restricted + '/{path*}',
        method: '*',
        config: {
            handler: function(request, reply) {
                return reply.redirect(Url.format(internals.restrictedUrl) + request.url.path).permanent();
            }
        }
    });

    server.route({
        path: Config.prefixes.api + '/{path*}',
        method: '*',
        config: {
            handler: function(request, reply) {
                return reply.redirect(Url.format(internals.apiUrl) + request.url.path).permanent();
            }
        }
    });

    return next();

};

exports.register.attributes = {
    name: 'redirect',
    pkg: Package
};
