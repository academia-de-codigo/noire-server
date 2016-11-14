'use strict';

var Package = require('../../package.json');

exports.authenticate = true;

exports.validate = function(request, reply) {

    if (!exports.authenticate) {
        return reply('error');
    }

    return reply.continue({
        credentials: exports.credentials
    });
};

exports.credentials = {
    id: 1,
    username: 'mock',
    scope: ['admin']
};

exports.register = function(server, options, next) {

    server.auth.scheme('mock', function() {
        return {
            authenticate: exports.validate
        };
    });

    server.auth.strategy('jwt', 'mock', 'try');
    next();
};

exports.register.attributes = {
    name: 'auth',
    pkg: Package
};
