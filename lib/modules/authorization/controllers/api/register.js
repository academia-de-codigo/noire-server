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

exports.register = async function(request, h) {
    try {
        // make sure we got a valid token before rendering registration form
        await Auth.decodeSignupToken(request.query.token);
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
exports.doRegister = async function(request, h) {
    let id;

    try {
        id = (await Auth.decodeSignupToken(request.query.token)).id;
    } catch (error) {
        request.logger.debug({ message: error.message }, 'registration failure');
        throw NSError.AUTH_UNAUTHORIZED('Authentication Failure');
    }

    const user = await ContactService.register(id, request.payload);
    request.logger.info({ user: user }, 'user registration');

    return h.response(Hoek.merge(internals.registerResponse, { id: user.id }));
};
