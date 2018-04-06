const Package = require('package.json');

const internals = {};
internals.logger = {
    info: () => {},
    debug: () => {},
    error: () => {},
    child: () => internals.logger
};

const register = async function(server) {
    server.decorate('server', 'logger', () => internals.logger);
    server.decorate('request', 'logger', internals.logger);
};

exports.fake = internals.logger;

exports.plugin = {
    name: 'logger',
    pkg: Package,
    register
};
