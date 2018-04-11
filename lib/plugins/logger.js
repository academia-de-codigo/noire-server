/**
 * Logger plugin
 * @module
 */
const Hoek = require('hoek');
const Pino = require('hapi-pino');
const Package = require('package.json');
const Config = require('lib/config');

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
    await server.register({ plugin: Pino, options });

    // store the logger instance
    internals.log = server.logger();

    server.events.on('route', event => {
        internals.log.child({ method: event.method, path: event.path }).debug('route');
    });

    internals.log.child({ plugin: exports.plugin.name }).debug('started');

    // decorate this module with all logging levels,
    // other modules can now require this plugin and do Logger.err();
    Object.keys(internals.log.levels.labels).forEach(key => {
        const level = internals.log.levels.labels[key];

        // export and make sure we preserve logger context
        exports[level] = internals.log[level].bind(internals.log);
    });
};

exports.plugin = {
    name: 'logger',
    pkg: Package,
    register
};
