'use strict';

var Inert = require('inert');
var Path = require('path');
var Package = require('../../package.json');
var Config = require('../config');

exports.register = function(server, options, next) {

    server.register(Inert, function(err) {

        if (err) {
            return next(err);
        }

        // Routing for static files
        server.route([{
            method: 'GET',
            path: Path.resolve(Config.prefixes.images, '{assetpath*}'),
            config: {
                auth: false,
                handler: {
                    directory: {
                        path: Path.join('.', Config.prefixes.images)
                    }
                },
                app: {
                    redirect: false
                },
                cache: Config.cache.images
            }
        }, {
            method: 'GET',
            path: Path.resolve(Config.prefixes.scripts, '{assetpath*}'),
            config: {
                auth: false,
                handler: {
                    directory: {
                        path: Path.join('.', Config.prefixes.scripts)
                    }
                },
                app: {
                    redirect: false
                },
                cache: Config.cache.scripts
            }
        }, {
            method: 'GET',
            path: Path.resolve(Config.prefixes.styles, '{assetpath*}'),
            config: {
                auth: false,
                handler: {
                    directory: {
                        path: Path.join('.', Config.prefixes.styles)
                    }
                },
                app: {
                    redirect: false
                },
                cache: Config.cache.styles
            }
        }, {
            method: 'GET',
            path: Path.resolve(Config.prefixes.fonts, '{assetpath*}'),
            config: {
                auth: false,
                handler: {
                    directory: {
                        path: Path.join('.', Config.prefixes.fonts)
                    }
                },
                app: {
                    redirect: false
                },
                cache: Config.cache.fonts
            }
        }]);

        return next();

    });

};

exports.register.attributes = {
    name: 'assets',
    pkg: Package
};
