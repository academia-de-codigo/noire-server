'use strict';

var Package = require('../package.json');

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
            description: 'Returns the version of the server',
            handler: function(request, reply) {

                return reply(internals.response);
            }
        }
    });

    next();

};

exports.register.attributes = {
    name: 'version'
};
