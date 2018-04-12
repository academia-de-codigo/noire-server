const Joi = require('joi');
const ContactsCtrl = require('modules/authorization/controllers/api/contacts');

// GET /signup
exports.getSignup = {
    description: 'Returns the user signup form',
    auth: false,
    handler: {
        view: {
            template: 'pages/signup'
        }
    }
};

// POST /signup
exports.postSignup = {
    description: 'Signs up a new user',
    handler: ContactsCtrl.signup,
    auth: false,
    validate: {
        payload: {
            email: Joi.string().email()
        }
    },
    plugins: {
        stateless: false
    }
};
