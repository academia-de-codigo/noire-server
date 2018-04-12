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

/**
 * Signs up a user
 * @param {Request} request the request object
 * @param {Toolkit} h the response toolkit
 * @returns {Response} the response object
 */
exports.signup = async function(request, h) {
    try {
        await ContactService.signup(request.payload.email);

        request.logger.info({ email: request.payload.email }, 'user signup');
        return h.response(internals.signupResponse);
    } catch (error) {
        request.logger.debug({ email: request.payload.email }, 'signup failure');
        return error;
    }
};
