/**
 * API register routes
 * @module
 */
const RegisterCtrl = require('modules/authorization/controllers/register');
const Validator = require('modules/authorization/validators/register');
const { documentationTags } = require('config');

const tags = documentationTags.authorization;

const descriptions = {
    token: 'The auth token',
    register: [
        'The real name of the user',
        'The username of the user',
        'The email of the user',
        'The password of the user'
    ]
};

// POST /register
exports.register = {
    auth: false,
    description: 'Registers a new user',
    handler: RegisterCtrl.register,
    tags,
    validate: {
        query: Validator.validateAuthToken(descriptions.token),
        payload: Validator.validateRegisterFields(...descriptions.register)
    }
};
