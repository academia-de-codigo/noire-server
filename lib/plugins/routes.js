'use strict';

var Path = require('path');
var HandleBars = require('handlebars');
var Config = require('../config');
var Package = require('../../package.json');

var internals = {
    viewsPath: Path.resolve(__dirname, '../../views'),
    partialsPath: Path.resolve(__dirname, '../../views/partials')
};

exports.register = function(server, options, next) {

    server.dependency(['auth', 'vision'], internals.after);
    return next();

};

internals.after = function(server, next) {

    server.views({
        engines: {
            hbs: HandleBars
        },
        isCached: Config.cache.views.isCached,
        path: internals.viewsPath,
        partialsPath: internals.partialsPath,
        relativeTo: __dirname
    });

    server.route({
        path: '/home',
        method: 'GET',
        config: {
            description: 'Returns the home page',
            auth: {
                mode: 'try'
            },
            //TODO: move code into home controller, unit test
            handler: function(request, reply) {

                var user = null;
                if (request.auth.isAuthenticated) {
                    user = request.auth.credentials;

                    if (user.scope.indexOf('admin') !== -1) {
                        user.admin = true;
                    }
                }

                return reply.view('home', {
                    version: Package.version,
                    user: user
                });
            }
        }
    });

    server.route({
        path: Config.paths.login,
        method: 'GET',
        config: {
            description: 'Returns the login page',
            auth: false,
            handler: {
                view: {
                    template: 'login',
                }
            }
        }
    });

    server.route({
        path: Config.prefixes.admin,
        method: 'GET',
        config: {
            description: 'Returns the admin section',
            auth: {
                scope: 'admin'
            },
            handler: function(request, reply) {

                return reply.view('admin', {
                    user: request.auth.credentials,
                });
            }
        }
    });

    server.route({
        path: '/account',
        method: 'GET',
        config: {
            description: 'Returns the user account page',
            auth: {
                scope: 'user'
            },
            handler: function(request, reply) {

                return reply.view('account', {
                    user: request.auth.credentials
                });
            }
        }
    });

    return next();

};

exports.register.attributes = {
    name: 'routes',
    pkg: Package
};
