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

const internals = {};

internals.validate = async function(decoded, request) {
    try {
        const user = await UserService.findById(decoded.id);

        internals.validateTokenVersion(decoded);

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
        request.logger.debug({ decoded, err }, 'jwt invalid');
        return { isValid: false };
    }
};

/**
 * Validates if the provided JWT has the current token version
 * @param {object} decodedToken the decoded JWT as an object
 */

internals.validateTokenVersion = function(decodedToken) {
    if (decodedToken.version !== Config.auth.version) {
        throw NSError.AUTH_INVALID_TOKEN(
            `invalid token version. Was ${decodedToken.version}, expected ${Config.auth.version}`
        );
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
        verifyOptions: { algorithms: ['HS256'], audience: exports.token.AUTH }
    });

    // define the default auth strategy for every route
    // routes that don't require authentication should explicitly have their auth property set to false
    server.auth.default('jwt');

    server
        .logger()
        .child({ plugin: exports.plugin.name })
        .debug('started');
};

exports.token = {
    AUTH: 'noire:auth',
    SIGNUP: 'noire:signup',
    PASSWORD_RESET: 'noire:password-reset',
    REGEX: /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/
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
 * Gets a signed jwt token
 * @param {object} payload the token payload
 * @param {boolean|number|string} expiresIn expressed in seconds or a string describing a time span or false if token never expires
 * @param {string} tokenType the type of token to sign
 * @returns {Promise<string>} the token
 */
exports.getToken = function(payload, expiresIn = '1h', tokenType = exports.token.AUTH) {
    const secret = new Buffer(process.env.JWT_SECRET, 'base64');
    const sign = Util.promisify(JWT.sign);

    payload.version = payload.version || Config.auth.version;

    if (tokenType === exports.token.AUTH && !payload.loggedInAt) {
        payload.iat = Math.floor(Date.now() / 1000); // same as jwt implementation
        payload.loggedInAt = payload.iat;
    }

    let options = { audience: [tokenType] };
    if (expiresIn) {
        options.expiresIn = expiresIn;
    }

    return sign(payload, secret, options);
};

/**
 * Verifies and decodes a jwt token
 * @param {string} token the jwt token
 * @param {type} token the jwt token type
 */
exports.decodeToken = function(token, type = exports.token.AUTH) {
    const decode = Util.promisify(JWT.verify);
    const secret = new Buffer(process.env.JWT_SECRET, 'base64');

    return decode(token, secret, {
        audience: [type]
    });
};

/**
 * Generates a signed JWT based on information present in another.
 * @param {string} token the JWT to be renewed
 * @returns {Promise<string>} the renewed JWT
 */

exports.renewToken = async function(token) {
    const { id, loggedInAt } = JWT.decode(token);
    const expiresIn = Config.auth.renewIn || '1h';

    // iat value is in seconds according to the JWT RFC
    // due to that, loggedInAt is a value in seconds as well
    const nonRenewableAt = (Config.auth.loginIn || 60 * 60) + loggedInAt;
    let now = Math.floor(Date.now() / 1000);

    if (now > nonRenewableAt) {
        throw NSError.AUTH_INVALID_TOKEN('non renewable token');
    }

    return exports.getToken({ id }, expiresIn);
};

exports.plugin = {
    name: 'auth',
    pkg: Package,
    register
};
