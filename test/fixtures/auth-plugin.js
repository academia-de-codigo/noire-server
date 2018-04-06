const Boom = require('boom');
const Package = require('package.json');

exports.authenticate = true;

exports.credentials = {
    id: 1,
    username: 'mock',
    scope: ['admin', 'user']
};

exports.validate = function(request, h) {
    return exports.authenticate
        ? h.authenticated({ credentials: exports.credentials })
        : h.unauthenticated(Boom.unauthorized('error'));
};

const register = function(server) {
    server.auth.scheme('mock', () => {
        return { authenticate: exports.validate };
    });

    server.auth.strategy('default', 'mock');
    server.auth.default('default');
};

exports.plugin = {
    register: register,
    name: 'auth',
    pkg: Package
};
