'use strict';

var Boom = require('boom');
var Url = require('url');
var UserService = require('../services/user');
var Auth = require('../plugins/auth');
var Config = require('../config');

var internals = {};
internals.webTlsUrl = {
    protocol: 'https',
    slashes: true,
    hostname: Config.connections.webTls.host,
    port: Config.connections.webTls.port
};

internals.webUrl = {
    protocol: 'http',
    slashes: true,
    hostname: Config.connections.web.host,
    port: Config.connections.web.port
};

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

    return reply.redirect(Url.format(internals.webTlsUrl) + Config.paths.home)
        .header('Authorization', token)
        .state('token', token, internals.cookieOptions); // store token in cookie
};

exports.logout = function(request, reply) {

    return reply.redirect(Url.format(internals.webUrl) + Config.paths.home)
        .unstate('token', internals.cookieOptions);
};
