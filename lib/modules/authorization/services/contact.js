const Repository = require('plugins/repository');
const NSError = require('errors/nserror');
const Auth = require('plugins/auth');

/**
 * Signs up a new user by adding its contact
 * @param {string} email the user email contact
 */
exports.signup = async function(email) {
    // signup is not transactional, not really concerned if we end up with some duplicate contacts
    const user = await Repository.user.query().findOne({ email });

    if (user) {
        throw NSError.RESOURCE_DUPLICATE('invalid email address');
    }

    const contact = await Repository.contact.add({ email, confirmed: false });
    const token = await Auth.getSignUpToken(contact.id);

    //TODO: fire email with confirmation link
};

/**
 * Registers a new user
 * @param {Request} request the request object
 * @param {Toolkit} h the response toolkit
 * @returns {Response} the response object containing TODO: ...
 */
exports.register = async function() {
    //TODO:
    // grab contact id from token
    // fetch contact from db
    // match contact email with form email
    // add new user
};
