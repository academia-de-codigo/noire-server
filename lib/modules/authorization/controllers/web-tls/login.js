/**
 * Web-Tls Login controller
 * @module
 */
const Auth = require('plugins/auth');
const NSError = require('errors/nserror');

/**
 * Validates the password reset token and shows the password update form
 * @param {Request} request the request object
 * @param {Toolkit} h the response toolkit
 * @returns {Response} the response object
 */
exports.showPasswordUpdate = async function(request, h) {
    try {
        // make sure we got a valid token before rendering registration form
        await Auth.decodeToken(request.query.token, Auth.token.PASSWORD_RESET);
    } catch (error) {
        request.logger.debug({ message: error.message }, 'password update failure');
        throw NSError.AUTH_UNAUTHORIZED('Authentication Failure');
    }

    return h.view('pages/password-update');
};
