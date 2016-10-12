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

    if (!user) {
        return reply(Boom.unauthorized('Invalid email address'));
    }

    if (user.password !== request.payload.password) {
        return reply(Boom.unauthorized('Bad password'));
    }

    var token = Auth.getToken(user.id);
    var userAccount = Hoek.clone(user);
    delete userAccount.password;

    if (request.route.settings.plugins.stateless) {

        // api uses stateless auth (no cookies) and hence does not require csrf protection
        return reply(userAccount).header('Authorization', token);
    }

    return reply(userAccount)
        .header('Authorization', token) // send token in auth header for ajax requests
        .state('token', token, internals.cookieOptions); // store token in cookie for server side rendered pages
};

exports.logout = function(request, reply) {

    if (request.route.settings.plugins.stateless) {
        return reply({ message: 'Logged out' });
    }

    return reply({ message: 'Logged out' })
        .unstate('token', internals.cookieOptions); // clear stored token
};
