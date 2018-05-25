const Joi = require('joi');
const AuthCtrl = require('modules/authorization/controllers/authorization');
const ContactsCtrl = require('modules/authorization/controllers/api/contacts');

const resource = 'contact';

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

// GET /contact
exports.list = {
    description: 'List all contacts',
    pre: [AuthCtrl.authorize(resource)],
    handler: ContactsCtrl.list,
    validate: {
        query: {
            limit: Joi.number()
                .integer()
                .min(1)
                .max(100),
            page: Joi.number()
                .integer()
                .positive(),
            search: Joi.string(),
            sort: Joi.string()
        }
    }
};

// GET /contact/{id}
exports.get = {
    description: 'Get an existing contact',
    pre: [AuthCtrl.authorize(resource)],
    handler: ContactsCtrl.get,
    validate: {
        params: {
            id: Joi.number()
                .integer()
                .required()
        }
    }
};

// DELETE /contact/{id}
exports.delete = {
    description: 'Delete an existing contact',
    pre: [AuthCtrl.authorize(resource)],
    handler: ContactsCtrl.delete,
    validate: {
        params: {
            id: Joi.number()
                .integer()
                .required()
        }
    }
};
