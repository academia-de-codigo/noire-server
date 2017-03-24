var Path = require('path');
var Package = require('../../package.json');
var Config = require('../config');
var Inert = require('inert');

var internals = {};
internals.routes = function(server) {

    // Routing for static files
    server.route([{
        method: 'GET',
        path: '/favicon.ico',
        config: {
            auth: false,
            handler: {
                file: Path.join('.', 'favicon.ico')
            },
            app: {
                redirect: false
            },
            cache: Config.cache.images
        }
    }, {
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
};

exports.register = function(server, options, next) {

    server.register(Inert, function(err) {

        if (err) {
            return next(err);
        }

        internals.routes(server);
        return next();
    });
};

exports.register.attributes = {
    name: 'assets',
    pkg: Package
};
