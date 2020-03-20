/**
 * API login routes
 * @module
 */
const LoginCtrl = require('modules/authorization/controllers/login');
const Validator = require('modules/authorization/validators/login');
const { documentationTags } = require('config');

const tags = documentationTags.authorization;

const descriptions = {
    login: ['The username of the user to login', 'The password of the user'],
    passReset: 'The email of the user to reset',
    passUpdate: ['The email of the user to update', 'The new password']
};

// POST /login
exports.login = {
    auth: false,
    description: 'Authenticate user credentials',
    handler: LoginCtrl.login,
    tags,
    validate: {
        payload: Validator.validateLoginCredentials(...descriptions.login)
    },
    plugins: {
        stateless: true
    }
};

// GET /logout
exports.logout = {
    description: 'Destroys authenticated session',
    handler: LoginCtrl.logout,
    tags,
    plugins: {
        stateless: true
    }
};

// GET /renew
exports.renew = {
    description: 'Renews an authenticated session',
    handler: LoginCtrl.renew,
    tags
};

// POST /password-reset
exports.passwordReset = {
    auth: false,
    description: 'Sends a password reset email',
    handler: LoginCtrl.passwordReset,
    tags,
    validate: {
        payload: Validator.validateRequiredEmail(descriptions.passReset)
    }
};

// POST /password-update
exports.passwordUpdate = {
    auth: false,
    description: 'Registers up a new user',
    handler: LoginCtrl.passwordUpdate,
    tags,
    validate: {
        payload: Validator.validatePassUpdate(...descriptions.passUpdate)
    }
};
