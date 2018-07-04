/**
 * API Login controller
 * @module
 */
const Config = require('config');
const Auth = require('plugins/auth');
const UserService = require('modules/authorization/services/user');
const NSError = require('errors/nserror');

const internals = {};
internals.cookieOptions = {
    ttl: 1 * 24 * 60 * 60 * 1000, // expires in one day
    encoding: 'none', // we already used JWT to encode
    isSecure: true, // warm & fuzzy feelings
    isHttpOnly: true, // prevent javascript from messing with it
    clearInvalid: false, // remove invalid cookies
    strictHeader: true // don't allow violations of RFC 6265
};

internals.loginResponse = {
    success: true,
    message: 'logged in'
};

internals.logoutResponse = {
    success: true,
    message: 'logged out'
};

internals.resetResponse = {
    success: true,
    message: 'password reset'
};

internals.updatePassword = {
    success: true,
    message: 'password update'
};

/**
 * Login a user
 * @async
 * @param {Request} request the request object
 * @param {Toolkit} h the response toolkit
 * @returns {Response} the response object containing the jwt token
 */
exports.login = async function(request, h) {
    try {
        const token = await UserService.authenticate(
            request.payload.username,
            request.payload.password,
            request.route.settings.plugins.stateless ? Config.auth.renewIn : Config.auth.expiresIn
        );

        if (request.route.settings.plugins.stateless) {
            // api uses stateless auth (no cookies) and hence does not require csrf protection
            return h.response(internals.loginResponse).header('Server-Authorization', token);
        }

        return h
            .response(internals.loginResponse)
            .header('Server-Authorization', token) // send token in auth header for ajax requests
            .state('token', token, internals.cookieOptions); // store token in cookie for server side rendered pages
    } catch (error) {
        if (NSError.AUTH_INVALID_CREDENTIALS.match(error)) {
            request.logger.debug({ username: request.payload.username }, 'login failure');
        }

        return error;
    }
};

/**
 * Logout a user
 * @param {Request} request the request object
 * @param {Toolkit} h the response toolkit
 * @returns {Response} the response object
 */
exports.logout = function(request, h) {
    if (request.route.settings.plugins.stateless) {
        return internals.logoutResponse;
    }

    return h.response(internals.logoutResponse).unstate('token'); // clear stored token
};

/**
 * Renew user authentication
 * @param {Request} request the request object
 * @param {Toolkit} h the response toolkit
 * @returns {Response} the response object containing the jwt token
 */
exports.renew = async function(request, h) {
    const splitAuthorizationHeader = request.headers.authorization.split(' ');

    // Authorization Header syntax: [type] <credentials>
    const credentials =
        splitAuthorizationHeader.length === 1
            ? splitAuthorizationHeader[0]
            : splitAuthorizationHeader[1];

    const token = await Auth.renewToken(credentials);
    return h.response(internals.loginResponse).header('Server-Authorization', token);
};

/**
 * Sends email with password reset link
 * @param {Request} request the request object
 * @param {Toolkit} h the response toolkit
 * @returns {Response} the response object
 */
exports.passwordReset = async function(request, h) {
    try {
        await UserService.sendPasswordResetEmail(request.payload.email);

        request.logger.info({ email: request.payload.email }, 'password reset');
        return h.response(internals.resetResponse);
    } catch (error) {
        request.logger.debug({ email: request.payload.email }, 'password reset failure');
        return error;
    }
};

/**
 * Updates the user password
 * @param {Request} request the request object
 * @param {Toolkit} h the response toolkit
 * @returns {Response} the response object
 */
exports.passwordUpdate = async function(request, h) {
    let id, user;

    try {
        // make sure we got a valid token before rendering registration form
        id = (await Auth.decodeToken(request.query.token, Auth.token.PASSWORD_RESET)).id;
        user = await UserService.findById(id);
    } catch (error) {
        request.logger.debug({ message: error.message }, 'password update failure');
        throw NSError.AUTH_UNAUTHORIZED('Authentication Failure');
    }

    if (!user.active || user.email !== request.payload.email) {
        request.logger.debug('password update failed for inactive user');
        throw NSError.AUTH_UNAUTHORIZED();
    }

    await UserService.update(id, request.payload);
    request.logger.info({ user: user }, 'password update');

    return h.response(internals.updatePassword);
};
