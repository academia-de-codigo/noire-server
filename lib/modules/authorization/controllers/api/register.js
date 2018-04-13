/**
 * Register Controller
 * @module
 */
const Hoek = require('hoek');
const Auth = require('plugins/auth');
const NSError = require('errors/nserror');
const ContactService = require('modules/authorization/services/contact');

const internals = {};
internals.registerResponse = {
    success: true,
    message: 'registered'
};

/**
 *
 * @param {Request} request the request object
 * @param {Toolkit h the response toolkit
 * @returns {Response} the response object
 */
exports.showRegister = async function(request, h) {
    try {
        // make sure we got a valid token before rendering registration form
        await Auth.decodeToken(request.query.token, Auth.token.SIGNUP);
    } catch (error) {
        request.logger.debug({ message: error.message }, 'registration failure');
        throw NSError.AUTH_UNAUTHORIZED();
    }

    return h.view('pages/register');
};

/**
 * Registers a user
 * @param {Request} request the request object
 * @param {Toolkit} h the response toolkit
 * @returns {Response} the response object
 */
exports.register = async function(request, h) {
    let id;

    try {
        id = (await Auth.decodeToken(request.query.token, Auth.token.SIGNUP)).id;
    } catch (error) {
        request.logger.debug({ message: error.message }, 'registration failure');
        throw NSError.AUTH_UNAUTHORIZED('Authentication Failure');
    }

    const user = await ContactService.register(id, request.payload);
    request.logger.info({ user: user }, 'user registration');

    return h.response(Hoek.merge(internals.registerResponse, { id: user.id }));
};
