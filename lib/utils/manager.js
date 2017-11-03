const Util = require('util');
const Glue = require('glue');
const Exiting = require('exiting');

const internals = {};

exports.start = function(manifest, options) {

    let hapiServer;

    return Glue.compose(manifest, options).then((server) => {

        hapiServer = server;
        internals.manager = new Exiting.Manager(server);

        // Required before v3, which will add support for async methods
        return Util.promisify(internals.manager.start).bind(internals.manager)();
    }).then(() => {

        return hapiServer;
    });
};

exports.stop = function() {

    // Required before v3, which will add support for async methods
    return Util.promisify(internals.manager.stop).bind(internals.manager)();
};


// ['starting', 'started', 'stopping', 'prestopped', 'stopped', 'startAborted', 'errored', 'timeout']
exports.getState = function() {

    var stopped = 'stopped';
    var state = internals.manager ? internals.manager.state : stopped;
    return state ? state : stopped;
};

exports.reset = function() {
    internals.manager = null;
    Exiting.reset();
};
