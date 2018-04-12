/**
 * Authentication plugin, works as a wrapper around hapi-auth-jwt2 and jsonwebtoken
 * @module
 */
const AuthJWT = require('hapi-auth-jwt2');
const Util = require('util');
const JWT = require('jsonwebtoken');
const Bcrypt = require('bcrypt');
const Package = require('package.json');
const UserService = require('modules/authorization/services/user');
const NSError = require('errors/nserror');
const Config = require('config');

const internals = {
    secret: new Buffer(process.env.JWT_SECRET, 'base64'),
    jwtExpire: Config.auth.expiresIn || '1h',
    audience: {
        authentication: 'noire:auth',
        signup: 'noire:signup',
        registration: 'noire:registration'
    }
};

internals.signToken = function(payload, options = {}) {
    // signed token
    const sign = Util.promisify(JWT.sign);
    return sign(payload, internals.secret, options);
};

internals.validate = async function(decoded, request) {
    try {
        const user = await UserService.findById(decoded.id);

        const credentials = {
            id: user.id,
            username: user.username,
            email: user.email,
            avatar: user.avatar,
            scope: user.roles.map(role => role.name)
        };

        if (credentials.scope.indexOf('admin') !== -1) {
            credentials.admin = true;
        }

        request.logger.debug({ credentials }, 'jwt valid');
        return { isValid: true, credentials };
    } catch (err) {
        request.logger.debug({ decoded }, 'jwt invalid');
        return { isValid: false };
    }
};

/**
 * Plugin registration function
 * @async
 * @param {Hapi.Server} server the hapi server
 */
const register = async function(server) {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length === 0) {
        throw new Error('JWT_SECRET environment variable is empty');
    }

    // register the hapi-auth-jwt2 authentication plugin
    await server.register(AuthJWT);

    // base64 encoded
    const secret = new Buffer(process.env.JWT_SECRET, 'base64');

    server.auth.strategy('jwt', 'jwt', {
        key: secret,
        validate: internals.validate,
        verifyOptions: { algorithms: ['HS256'], audience: internals.audience.authentication }
    });

    server.auth.default('jwt');

    server
        .logger()
        .child({ plugin: exports.plugin.name })
        .debug('started');
};

/**
 * Hashes a password
 * @async
 * @param {string} password the password to hash
 * @returns {string} the password hash
 */
exports.crypt = async function(password) {
    try {
        return await Bcrypt.hash(password, 10);
    } catch (err) {
        throw NSError.AUTH_CRYPT_ERROR();
    }
};

/**
 * Checks a password against a password hash
 * @async
 * @param {string} password the password to check
 * @param {string} hash the hash to be checked to
 * @returns {boolean} the check result
 */
exports.compare = async function(password, hash) {
    try {
        return await Bcrypt.compare(password, hash);
    } catch (err) {
        throw NSError.AUTH_CRYPT_ERROR();
    }
};

/**
 * Gets the id from a jwt token
 * @param {string} token the jwt token
 * @returns {number} the token id
 */
exports.getId = function(token) {
    return JWT.decode(token).id;
};

/**
 * Gets a signed jwt authentication token
 * @async
 * @param {string} id the user id
 * @param {boolean|number|string} expiresIn expressed in seconds or a string describing a time span or false if token never expires
 * @returns {Promise<string>} the token
 */
exports.getToken = function(id, expiresIn = internals.jwtExpire) {
    // token options
    const options = {
        audience: [internals.audience.authentication]
    };

    if (expiresIn) {
        options.expiresIn = expiresIn;
    }

    return internals.signToken({ id }, options);
};

/**
 * Gets a signed jwt signup token
 * @async
 * @param {string} id the contact id
 * @returns {Promise<string>} the token
 */
exports.getSignUpToken = function(id) {
    // token options
    const options = {
        audience: [internals.audience.signup],
        expiresIn: Config.auth.signupIn
    };

    return internals.signToken({ id }, options);
};

/**
 * Verifies and decodes a jwt signup token
 * @param {string} token the jwt signup token
 */
exports.decodeSignupToken = async function(token) {
    const decode = Util.promisify(JWT.verify);

    return await decode(token, internals.secret, {
        audience: internals.audience.signup
    });
};

exports.plugin = {
    name: 'auth',
    pkg: Package,
    register
};
