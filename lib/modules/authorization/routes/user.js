/**
 * API user resource routes
 * @module
 */
const AuthCtrl = require('modules/authorization/controllers/authorization');
const UserCtrl = require('modules/authorization/controllers/user');
const Resources = require('enums/resources');
const Validator = require('modules/authorization/validators/user');
const { documentationTags } = require('config');

const tags = documentationTags.authorization;

const descriptions = {
    id: 'The ID of the user',
    query: [
        'The limit of users to get',
        'The page number to get the users from',
        'The search criteria',
        'The sorting order'
    ],
    user: [
        'The username of the user',
        'The real name of the user',
        'The email of the user',
        'The password of the user',
        'The URI to the user avatar',
        'If the user is active'
    ]
};

// GET /user
exports.list = {
    description: 'Lists available users',
    pre: [AuthCtrl.authorize(Resources.USER)],
    handler: UserCtrl.list,
    tags,
    validate: {
        query: Validator.validateQueryParams(...descriptions.query)
    }
};

// GET /user/{id}
exports.get = {
    description: 'Get user by ID',
    pre: [AuthCtrl.authorize(Resources.USER)],
    handler: UserCtrl.get,
    tags,
    validate: {
        params: Validator.validateRequiredId(descriptions.id)
    }
};

// POST /user
exports.create = {
    description: 'Add a new user',
    pre: [AuthCtrl.authorize(Resources.USER)],
    handler: UserCtrl.create,
    tags,
    validate: {
        payload: Validator.validateUserCreationFields(...descriptions.user)
    }
};

// DELETE /user/{id}
exports.delete = {
    description: 'Delete an existing user',
    pre: [AuthCtrl.authorize(Resources.USER)],
    handler: UserCtrl.delete,
    tags,
    validate: {
        params: Validator.validateRequiredId(descriptions.id)
    }
};

// PUT /user/{id}
exports.update = {
    description: 'Update an existing user',
    pre: [AuthCtrl.authorize(Resources.USER)],
    handler: UserCtrl.update,
    tags,
    validate: {
        params: Validator.validateRequiredId(descriptions.id),
        payload: Validator.validateUserUpdateFields(...descriptions.user)
    }
};
