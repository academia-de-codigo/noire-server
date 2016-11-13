'use strict';

var UserService = require('../services/user');
var HSError = require('../error');

var internals = {};
internals.cookieOptions = {
    ttl: 1 * 24 * 60 * 60 * 1000, // expires in one day
    encoding: 'none', // we already used JWT to encode
    isSecure: true, // warm & fuzzy feelings
    isHttpOnly: true, // prevent javascript from messing with it
    clearInvalid: false, // remove invalid cookies
    strictHeader: true // don't allow violations of RFC 6265
};

exports.login = function(request, reply) {

    UserService.authenticate(request.payload.email, request.payload.password).then(function(token) {

        request.log(['auth', 'login', 'debug']);

        if (request.route.settings.plugins.stateless) {

            // api uses stateless auth (no cookies) and hence does not require csrf protection
            return reply().header('Authorization', token);
        }

        return reply()
            .header('Authorization', token) // send token in auth header for ajax requests
            .state('token', token, internals.cookieOptions); // store token in cookie for server side rendered pages

    }).catch(function(error) {

        if (error === HSError.AUTH_INVALID_EMAIL) {
            request.log(['auth', 'login', 'failure', 'email', 'debug'], {
                email: request.payload.email
            });
        }

        if (error === HSError.AUTH_INVALID_PASSWORD) {
            request.log(['auth', 'login', 'failure', 'password', 'debug'], {
                email: request.payload.email
            });
        }

        reply(HSError.toBoom(error));
    });

};

exports.logout = function(request, reply) {

    request.log(['auth', 'logout', 'debug']);

    if (request.route.settings.plugins.stateless) {
        return reply({
            message: 'Logged out'
        });
    }

    return reply({
        message: 'Logged out'
    }).unstate('token'); // clear stored token
};
