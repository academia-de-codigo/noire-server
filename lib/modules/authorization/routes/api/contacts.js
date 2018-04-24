const Joi = require('joi');
const ContactsCtrl = require('modules/authorization/controllers/api/contacts');

// POST /signup
exports.signup = {
    description: 'Signs up a new user',
    handler: ContactsCtrl.signup,
    auth: false,
    validate: {
        payload: {
            email: Joi.string()
                .email()
                .required()
        }
    },
    plugins: {
        stateless: true
    }
};
