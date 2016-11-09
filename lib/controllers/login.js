'use strict';

var Boom = require('boom');
var Hoek = require('hoek');
var UserService = require('../services/user');
var Auth = require('../plugins/auth');

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

    var user = UserService.getByEmail(request.payload.email, request.payload.password);

    try {
        if (!user) {

            request.log(['auth', 'login', 'failure', 'email', 'debug'], {
                email: request.payload.email
            });

            throw Boom.unauthorized('Invalid email address');
        }

        if (user.password !== request.payload.password) {
            request.log(['auth', 'login', 'failure', 'password', 'debug'], {
                email: request.payload.email
            });

            throw Boom.unauthorized('Bad password');
        }

        var token = Auth.getToken(user.id);
        var userAccount = Hoek.clone(user);
        delete userAccount.password;

        request.log(['auth', 'login', 'debug'], userAccount);

        if (request.route.settings.plugins.stateless) {

            // api uses stateless auth (no cookies) and hence does not require csrf protection
            return reply(userAccount).header('Authorization', token);
        }

        return reply(userAccount)
            .header('Authorization', token) // send token in auth header for ajax requests
            .state('token', token, internals.cookieOptions); // store token in cookie for server side rendered pages

    } catch (error) {
        if (error.isBoom) {
            reply(error);
            return;
        }

        request.log(['error'], error);
        reply(Boom.badImplementation(error));
    }
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
