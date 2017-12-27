/**
 * Api version route
 * @module
 */
const Path = require('path');
const Package = require(Path.join(process.cwd(), 'package.json'));

const internals = {
    response: {
        version: Package.version
    }
};

// GET /version
exports.get = {
    auth: false,
    description: 'Returns the api version',
    handler: () => internals.response
};
