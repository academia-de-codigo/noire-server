'use strict';

var Boom = require('boom');
var Hoek = require('Hoek');
var UserService = require('../services/user');
var Auth = require('../plugins/auth');

var internals = {};
internals.cookieOptions = {
    ttl: 1 * 24 * 60 * 60 * 1000, // expires in one day
    encoding: 'none', // we already used JWT to encode
    isSecure: true, // warm & fuzzy feelings
    isHttpOnly: true, // prevent client alteration
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

    return reply(userAccount)
        .header('Authorization', token)
        .state('token', token, internals.cookieOptions); // store token in cookie
};

exports.logout = function(request, reply) {

    return reply({ message: 'Logged out' })
        .unstate('token', internals.cookieOptions); // clear stored token
};
