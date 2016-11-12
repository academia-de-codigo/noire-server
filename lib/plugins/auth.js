/**
 * Authentication plugin, works as a wrapper around hapi-auth-jwt2 and jsonwebtoken
 */
'use strict';

var AuthJWT = require('hapi-auth-jwt2');
var JWT = require('jsonwebtoken');
var Package = require('../../package.json');
var UserService = require('../services/user');

var internals = {
    JWT_EXPIRE: '8h',
};

internals.validateFunc = function(decoded, request, next) {

    UserService.findById(decoded.id).then(function(user) {

        var userData;
        if (user) {

            userData = {
                id: user.id,
                username: user.username,
                email: user.email,
                scope: user.roles.map(function(role) {
                    return role.name;
                })
            };

            request.log(['auth', 'jwt', 'valid', 'debug'], userData);
            return next(null, true, userData);

        }

        request.log(['auth', 'jwt', 'invalid'], decoded);
        return next(null, false);

    });

};

exports.getToken = function(id) {

    // base64 encoded
    var secret = new Buffer(process.env.JWT_SECRET, 'base64');

    return JWT.sign({
        id: id
    }, secret, {
        expiresIn: internals.JWT_EXPIRE
    });

};

exports.register = function(server, options, next) {

    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length === 0) {
        return next(new Error('JWT_SECRET environment variable is empty'));
    }

    server.register(AuthJWT, function(err) {

        if (err) {
            return next(err);
        }

        // base64 encoded
        var secret = new Buffer(process.env.JWT_SECRET, 'base64');

        server.auth.strategy('jwt', 'jwt', true, { // JWT auth is required for all routes
            key: secret,
            validateFunc: internals.validateFunc,
            verifyOptions: {
                algorithms: ['HS256']
            }
        });

        return next();

    });

};

exports.register.attributes = {
    name: 'auth',
    pkg: Package
};
