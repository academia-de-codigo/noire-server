'use strict';

var Path = require('path');
var HandleBars = require('handlebars');
var Vision = require('vision');
var Package = require('../../package.json');

var internals = {
    viewsPath: Path.resolve(__dirname, '../../views')
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
            relativeTo: __dirname
        });

        server.route({
            path: '/home',
            method: 'GET',
            config: {
                description: 'the server home page',
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

        return next();

    });

};

exports.register.attributes = {
    name: 'views',
    pkg: Package
};
