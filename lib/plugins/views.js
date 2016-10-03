'use strict';

var Path = require('path');
var HandleBars = require('handlebars');
var Vision = require('vision');
var Package = require('../../package.json');

var internals = {
    viewsPath: Path.resolve(__dirname, '../../views'),
    partialsPath: Path.resolve(__dirname, '../../views/partials')
};

exports.register = function(server, options, next) {

    server.register(Vision, function(err) {

        if (err) {
            return next(err);
        }

        server.views({
            engines: {
                hbs: HandleBars
            },
            isCached: false, // TODO: for development mode only
            path: internals.viewsPath,
            partialsPath: internals.partialsPath,
            relativeTo: __dirname
        });

        server.route({
            path: '/home',
            method: 'GET',
            config: {
                description: 'the home page',
                auth: false,
                handler: {
                    view: {
                        template: 'home',
                        context: {
                            version: Package.version
                        }
                    }
                }
            }
        });

        server.route({
            path: '/login',
            method: 'GET',
            config: {
                description: 'the login page',
                auth: false,
                handler: {
                    view: {
                        template: 'login',
                    }
                }
            }
        });

        return next();

    });

};

exports.register.attributes = {
    name: 'views',
    pkg: Package
};
