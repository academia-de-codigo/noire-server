'use strict';

var Url = require('url');
var Package = require('../../package.json');
var Config = require('../config.js');

var internals = {
    adminUrl: {
        protocol: 'https',
        slashes: true,
        hostname: Config.servers.admin.host,
        port: Config.servers.admin.port
    },
    apiUrl: {
        protocol: 'https',
        slashes: true,
        hostname: Config.servers.api.host,
        port: Config.servers.api.port
    }
};

exports.register = function(server, options, next) {

    server.route({
        path: Config.servers.admin.prefix + '/{path*}',
        method: '*',
        config: {
            handler: function(request, reply) {
                return reply.redirect(Url.format(internals.adminUrl) + request.url.path).permanent();
            }
        }
    });

    server.route({
        path: Config.servers.api.prefix + '/{path*}',
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
