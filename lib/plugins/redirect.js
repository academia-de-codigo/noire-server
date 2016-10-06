'use strict';

var Url = require('url');
var Package = require('../../package.json');
var Config = require('../config');

var internals = {
    webUrl: {
        protocol: 'http',
        slashes: true,
        hostname: Config.connections.web.host,
        port: Config.connections.web.port
    },
    webTlsUrl: {
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
            return reply.redirect(Url.format(internals.webTlsUrl) + request.url.path).permanent();
        }

        if (request.url.path === '/') {
            return reply.redirect(Url.format(internals.webUrl) + '/home').permanent();
        }

        if (request.url.path.startsWith(Config.prefixes.admin) || request.url.path.startsWith(Config.prefixes.account)) {
            return reply.redirect(Url.format(internals.webTlsUrl) + request.url.path).permanent();
        }

        reply.continue();

    });

    server.route({
        path: Config.prefixes.api + '/{path*}',
        method: '*',
        config: {
            auth: false,
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
