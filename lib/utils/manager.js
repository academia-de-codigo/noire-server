/**
 * Noire server manager
 * @module
 */
const Path = require('path');
const Glue = require('glue');
const Exiting = require('exiting');

const internals = {};

/**
 * Starts the noire server
 *
 * @param {Object} manifest server manifest
 * @returns {Promise<Hapi.Server>} the hapi server
 */
exports.start = async function(manifest) {

    const options = {
        relativeTo: Path.join(__dirname, '..')
    };

    const server = await Glue.compose(manifest, options);

    internals.manager = Exiting.createManager(server);
    await internals.manager.start();

    return server;
};

/**
 * Stops the noire server
 */
exports.stop = async function() {

    return await internals.manager.stop();
};


/**
 * Gets the noire server status
 * ['starting', 'started', 'stopping', 'prestopped', 'stopped', 'startAborted', 'errored', 'timeout']
 */
exports.getState = function() {

    var stopped = 'stopped';
    var state = internals.manager ? internals.manager.state : stopped;
    return state ? state : stopped;
};

/**
 * Resets the noire server, used mainly for testing purposes
 */
exports.reset = function() {
    internals.manager = null;
    Exiting.reset();
};
