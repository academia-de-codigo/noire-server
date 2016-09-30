'use strict';

var Package = require('../../package.json');

var internals = {
    response: {
        version: Package.version
    }
};

exports.register = function(server, options, next) {

    server.route({
        path: '/version',
        method: 'GET',
        config: {
            auth: false,
            description: 'Returns the version of the server',
            handler: function(request, reply) {

                return reply(internals.response);
            }
        }
    });

    return next();

};

exports.register.attributes = {
    name: 'version',
    pkg: Package
};
