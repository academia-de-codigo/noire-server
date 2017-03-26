/**
 * Authentication plugin, works as a wrapper around hapi-auth-jwt2 and jsonwebtoken
 */
var AuthJWT = require('hapi-auth-jwt2');
var JWT = require('jsonwebtoken');
var Bcrypt = require('bcrypt');
var Promise = require('bluebird');
var Package = require('../../package.json');
var UserService = require('../services/user');
var HSError = require('../error');
var Config = require('../config');

var internals = {
    jwtExpire: Config.auth.expiresIn || '1h'
};

internals.validateFunc = function(decoded, request, next) {

    UserService.findById(decoded.id).then(function(user) {

        var userData = {
            id: user.id,
            username: user.username,
            email: user.email,
            avatar: user.avatar,
            scope: user.roles.map(function(role) {
                return role.name;
            })
        };

        if (userData.scope.indexOf('admin') !== -1) {
            userData.admin = true;
        }

        request.log(['auth', 'jwt', 'valid', 'debug'], userData);
        return next(null, true, userData);

    }).catch(function() {

        request.log(['auth', 'jwt', 'invalid'], decoded);
        return next(null, false);
    });

};

exports.crypt = function(password) {

    if (!password) {
        return Promise.reject(HSError.AUTH_CRYPT_ERROR);
    }

    var hashAsync = Promise.promisify(Bcrypt.hash);
    return hashAsync(password, 10).then(function(hash) {

        if (!hash) {
            throw HSError.AUTH_CRYPT_ERROR;
        }

        return hash;

    });
};

exports.compare = function(password, hash) {

    var compareAsync = Promise.promisify(Bcrypt.compare);
    return compareAsync(password, hash).then(function(result) {

        if (result !== false && result !== true) {
            throw HSError.AUTH_CRYPT_ERROR;
        }

        return result;

    });
};

exports.getToken = function(id, forever) {

    // base64 encoded
    var secret = new Buffer(process.env.JWT_SECRET, 'base64');

    var options = (forever ? {} : {
        expiresIn: internals.jwtExpire
    });

    return JWT.sign({
        id: id
    }, secret, options);

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
