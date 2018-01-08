/**
 * API Login controller
 * @module
 */
const Path = require('path');
const UserService = require(Path.join(process.cwd(), 'lib/modules/authorization/services/user'));
const NSError = require(Path.join(process.cwd(), 'lib/errors/nserror'));

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

/**
 * Login a user
 * @async
 * @param {Request} request the request object
 * @param {Toolkit} h the response toolkit
 * @returns {Response} the response object containing the jwt token
 */
exports.login = async function(request, h) {

    try {

        const token = await UserService.authenticate(request.payload.username, request.payload.password);

        if (request.route.settings.plugins.stateless) {

            // api uses stateless auth (no cookies) and hence does not require csrf protection
            return h.response(internals.loginResponse).header('Authorization', token);
        }

        return h.response(internals.loginResponse).header('Authorization', token) // send token in auth header for ajax requests
            .state('token', token, internals.cookieOptions); // store token in cookie for server side rendered pages

    } catch (error) {

        if (NSError.AUTH_INVALID_USERNAME.match(error) || NSError.AUTH_INVALID_PASSWORD.match(error)) {
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
