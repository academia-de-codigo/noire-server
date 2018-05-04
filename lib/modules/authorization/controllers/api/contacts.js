/**
 * Contacts Controller
 * @module
 */
const ContactsService = require('modules/authorization/services/contacts');

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
        await ContactsService.signup(request.payload.email);

        request.logger.info({ email: request.payload.email }, 'user signup');
        return h.response(internals.signupResponse);
    } catch (error) {
        request.logger.debug(
            { email: request.payload.email, message: error.message },
            'signup failure'
        );
        return error;
    }
};

/**
 * Lists contacts
 * @async
 * @param {Request} request the request object
 * @param {Toolkit} h the response toolkit
 * @returns {Response} the response object containing the list of contacts
 */
exports.list = async function(request, h) {

    const [list, count] = await Promise.all([
        ContactsService.list(request.query),
        ContactsService.count(request.query)
    ]);

    return h.paginate(list, count);
};

/**
 * Delete a contact
 * @async
 * @param {Request} request the request object
 * @param {Toolkit} h the response toolkit
 * @returns {Response} the response object
 */
exports.delete = async function(request, h) {
    const id = Number.parseInt(request.params.id);
    await ContactsService.delete(id);

    return h.response();
};
