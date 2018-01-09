/**
 * Logger plugin
 * @module
 */
const Path = require('path');
const Hoek = require('hoek');
const Pino = require('hapi-pino');
const Package = require(Path.join(process.cwd(), 'package.json'));
const Config = require(Path.join(process.cwd(), 'lib/config'));

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
    internals.logger = await server.register({ plugin: Pino, options });

    server.events.on('route', event => {
        server.logger().child({
            method: event.method,
            path: event.path
        }).debug('route');
    });

    server.logger().child({ plugin: exports.plugin.name }).debug('started');
};

exports.plugin = {
    name: 'logger',
    pkg: Package,
    register
};

