'use strict';

var AuthJWT = require('hapi-auth-jwt2');
var JWT = require('jsonwebtoken');
var Package = require('../package.json');
var Users = require('./users.json');

var internals = {
    JWT_EXPIRE: '8h',
};

internals.validateFunc = function(decoded, request, next) {

    if (Users[decoded.id]) {
        return next(null, true);
    }

    return next(null, false);

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

        server.auth.strategy('jwt', 'jwt', 'required', {
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
