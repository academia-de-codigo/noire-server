const Joi = require('@hapi/joi');
const AuthCtrl = require('modules/authorization/controllers/authorization');
const ContactsCtrl = require('modules/authorization/controllers/contacts');
const Resources = require('enums/resources');
const Actions = require('enums/actions');

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
                .description('The email of the user')
        }
    },
    plugins: {
        stateless: true
    }
};

// GET /contact
exports.list = {
    description: 'List all contacts',
    pre: [AuthCtrl.authorize(Resources.CONTACT, Actions.LIST)],
    handler: ContactsCtrl.list,
    validate: {
        query: {
            limit: Joi.number()
                .integer()
                .min(1)
                .max(100)
                .description('The limit of contacts to get'),
            page: Joi.number()
                .integer()
                .positive()
                .description('The page number to get the contacts from'),
            search: Joi.string().description('The search criteria'),
            sort: Joi.string().description('The sorting order')
        }
    }
};

// GET /contact/{id}
exports.get = {
    description: 'Get an existing contact',
    pre: [AuthCtrl.authorize(Resources.CONTACT)],
    handler: ContactsCtrl.get,
    validate: {
        params: {
            id: Joi.number()
                .integer()
                .positive()
                .required()
                .description('The ID of the Contact')
        }
    }
};

// DELETE /contact/{id}
exports.delete = {
    description: 'Delete an existing contact',
    pre: [AuthCtrl.authorize(Resources.CONTACT)],
    handler: ContactsCtrl.delete,
    validate: {
        params: {
            id: Joi.number()
                .integer()
                .positive()
                .required()
                .description('The ID of the contact')
        }
    }
};
