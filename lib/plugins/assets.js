/**
 * Assets plugin
 * @module
 */
const Path = require('path');
const Package = require(Path.join(process.cwd(), 'package.json'));
const Config = require(Path.join(process.cwd(), 'lib/config'));
const Inert = require('inert');

const internals = {};
internals.routes = function(server) {

    // Routing for static files
    server.route([{
        method: 'GET',
        path: '/favicon.ico',
        options: {
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
        options: {
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
        options: {
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
        options: {
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
        options: {
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


/**
 * Plugin registration function
 * @async
 * @param {Hapi.Server} server the hapi server
 */
const register = async function(server) {

    await server.register(Inert);
    internals.routes(server);
};

exports.plugin = {
    name: 'assets',
    pkg: Package,
    register
};
