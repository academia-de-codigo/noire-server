/**
 * Api version route
 * @module
 */
const Package = require('package.json');

const internals = {
    response: {
        version: Package.version
    }
};

// GET /version
exports.get = {
    auth: false,
    description: 'Returns the api version',
    handler: () => internals.response,
};
