const AuthCtrl = require('modules/authorization/controllers/authorization');
const ContactsCtrl = require('modules/authorization/controllers/contacts');
const Resources = require('enums/resources');
const Actions = require('enums/actions');
const Validator = require('modules/authorization/validators/contacts');
const { documentationTags } = require('config');

const tags = documentationTags.authorization;

const descriptions = {
    email: 'The email of the user',
    query: [
        'The limit of contacts to get',
        'The page number to get the contacts from',
        'The search criteria',
        'The sorting order'
    ],
    id: 'The ID of the Contact'
};

// POST /signup
exports.signup = {
    auth: false,
    description: 'Signs up a new user',
    handler: ContactsCtrl.signup,
    tags,
    validate: {
        payload: Validator.validateRequiredEmail(descriptions.email)
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
    tags,
    validate: {
        query: Validator.validateQueryParams(...descriptions.query)
    }
};

// GET /contact/{id}
exports.get = {
    description: 'Get an existing contact',
    pre: [AuthCtrl.authorize(Resources.CONTACT)],
    handler: ContactsCtrl.get,
    tags,
    validate: {
        params: Validator.validateRequiredId(descriptions.id)
    }
};

// DELETE /contact/{id}
exports.delete = {
    description: 'Delete an existing contact',
    pre: [AuthCtrl.authorize(Resources.CONTACT)],
    handler: ContactsCtrl.delete,
    tags,
    validate: {
        params: Validator.validateRequiredId(descriptions.id)
    }
};
