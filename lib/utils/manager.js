/**
 * Noire server manager
 * @module
 */
const Glue = require('@hapi/glue');
const Hoek = require('@hapi/hoek');
const Exiting = require('exiting');

const internals = {
    pluginsPath: 'plugins'
};

/**
 * Starts the noire server
 * @async
 * @param {(Object|Array.<Object>)} manifests manifests for all server connections
 * @returns {Object.<Hapi.Server>} the hapi servers
 */
exports.start = async function(manifests) {
    manifests = Array.isArray(manifests) ? manifests : [manifests];

    const options = {
        relativeTo: internals.pluginsPath
    };

    const servers = {};

    // start each server connection in sequence
    for (const manifest of manifests) {
        // create a new hapi server
        const server = await Glue.compose(manifest, options);
        Hoek.assert(server.settings.app, 'server settings should not be empty');

        // get the server name
        const connection = server.settings.app.name;
        Hoek.assert(connection, 'server requires a name setting');

        servers[connection] = server;
    }

    // create a new exiting manager for all the hapi servers
    internals.manager = Exiting.createManager(Object.values(servers));
    await internals.manager.start();

    return servers;
};

/**
 * Stops the noire server
 * @async
 */
exports.stop = async function() {
    await internals.manager.stop();
};

/**
 * Gets the noire server status
 * ['starting', 'started', 'stopping', 'prestopped', 'stopped', 'startAborted', 'errored', 'timeout']
 * @returns {string} the server process status
 */
exports.getState = function() {
    const stopped = 'stopped';
    return internals.manager ? internals.manager.state : stopped;
};

/**
 * Resets the noire server, used mainly for testing purposes
 */
exports.reset = function() {
    internals.manager = null;
    Exiting.reset();
};
