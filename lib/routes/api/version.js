'use strict';

var Package = require('../../../package.json');

var internals = {
    response: {
        version: Package.version
    }
};

// GET /version
exports.get = {
    auth: false,
    description: 'Returns the api version',
    handler: function(request, reply) {

        return reply(internals.response);
    }
};
