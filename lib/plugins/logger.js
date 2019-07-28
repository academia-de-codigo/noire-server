/**
 * Logger plugin
 * @module
 */
const Hoek = require('@hapi/hoek');
const HapiPino = require('hapi-pino');
const Pino = require('pino');
const Config = require('config');
const Package = require('package.json');

const internals = {};
internals.options = {
    level: Config.debug ? 'debug' : 'info',
    prettyPrint: Config.debug || Config.environment === 'development',
    forceColor: true
};

/**
 * Plugin registration function
 * @async
 * @param {Hapi.Server} server the hapi server
 */
const register = async function(server) {
    Hoek.assert(server.settings.app.name);

    const options = Hoek.merge(internals.options, { name: server.settings.app.name });
    await server.register({ plugin: HapiPino, options });

    server.events.on('route', event => {
        server
            .logger()
            .child({ method: event.method, path: event.path })
            .debug('route');
    });

    server
        .logger()
        .child({ plugin: exports.plugin.name })
        .debug('started');
};

/**
 * Gets a new logger instance
 * @returns {Logger} the logger instance
 */
exports.getLogger = function() {
    return Pino(internals.options);
};

exports.plugin = {
    name: 'logger',
    pkg: Package,
    register
};
