/**
 * Noire server manager
 * @module
 */
const Path = require('path');
const Util = require('util');
const Glue = require('glue');
const Exiting = require('exiting');

const internals = {};

/**
 * Starts the noire server
 *
 * @param {Object} manifest server manifest
 * @returns {Promise<Hapi.Server>} the hapi server
 */
exports.start = function(manifest) {

    let hapiServer;
    let options = {
        relativeTo: Path.join(__dirname, '..')
    };

    return Glue.compose(manifest, options).then((server) => {

        hapiServer = server;
        internals.manager = new Exiting.Manager(server);

        // Required before v3, which will add support for async methods
        return Util.promisify(internals.manager.start).bind(internals.manager)();
    }).then(() => {

        return hapiServer;
    });
};

/**
 * Stops the noire server
 */
exports.stop = function() {

    // Required before v3, which will add support for async methods
    return Util.promisify(internals.manager.stop).bind(internals.manager)();
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
