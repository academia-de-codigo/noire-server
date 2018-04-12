/**
 * Contacts Controller
 * @module
 */
const ContactService = require('modules/authorization/services/contact');

const internals = {};

internals.signupResponse = {
    success: true,
    message: 'sign up'
};

internals.registerResponse = {
    success: true,
    message: 'registered'
};

/**
 * Signs up a user
 * @param {Request} request the request object
 * @param {Toolkit} h the response toolkit
 * @returns {Response} the response object containing the jwt token
 */
exports.signup = async function(request, h) {
    try {
        await ContactService.signup(request.payload.email);
        return h.response(internals.signupResponse);
    } catch (error) {
        request.logger.debug({ email: request.payload.email }, 'signup failure');
        return error;
    }
};

/**
 * Registers a user
 * @param {Request} request the request object
 * @param {Toolkit} h the response toolkit
 * @returns {Response} the response object containing the jwt token
 */
exports.register = async function(request, h) {
    await ContactService.register(request.payload);
    return h.response(internals.registerResponse);
};
