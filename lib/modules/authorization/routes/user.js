/**
 * Api user resource routes
 */
const Joi = require('@hapi/joi');
const AuthCtrl = require('modules/authorization/controllers/authorization');
const UserCtrl = require('modules/authorization/controllers/user');
const User = require('models/authorization/user');
const Resources = require('enums/resources');

// GET /user
exports.list = {
    description: 'Lists available users',
    pre: [AuthCtrl.authorize(Resources.USER)],
    handler: UserCtrl.list,
    validate: {
        query: {
            limit: Joi.number()
                .integer()
                .min(1)
                .max(100)
                .description('The limit of users to get'),
            page: Joi.number()
                .integer()
                .positive()
                .description('The page number to get the users from'),
            search: Joi.string().description('The search criteria'),
            sort: Joi.string().description('The sorting order')
        }
    }
};

// GET /user/{id}
exports.get = {
    description: 'Get user by ID',
    pre: [AuthCtrl.authorize(Resources.USER)],
    handler: UserCtrl.get,
    validate: {
        params: {
            id: Joi.number()
                .integer()
                .positive()
                .required()
                .description('The Id of the user')
        }
    }
};

// POST /user
exports.create = {
    description: 'Add a new user',
    pre: [AuthCtrl.authorize(Resources.USER)],
    handler: UserCtrl.create,
    validate: {
        payload: {
            username: Joi.string()
                .min(User.USERNAME_MIN_LENGTH)
                .max(User.USERNAME_MAX_LENGTH)
                .required()
                .description('The username of the user'),
            name: Joi.string()
                .min(User.NAME_MIN_LENGTH)
                .max(User.NAME_MAX_LENGTH)
                .required()
                .description('The real name of the user'),
            email: Joi.string()
                .email()
                .required()
                .description('The email of the user'),
            avatar: Joi.string()
                .uri({
                    scheme: ['http', 'https'],
                    allowRelative: true
                })
                .description('The URI to the user avatar'),
            password: Joi.string()
                .min(User.PASSWORD_MIN_LENGTH)
                .max(User.PASSWORD_MAX_LENGTH)
                .required()
                .description('The password of the user')
        }
    }
};

// DELETE /user/{id}
exports.delete = {
    description: 'Delete an existing user',
    pre: [AuthCtrl.authorize(Resources.USER)],
    handler: UserCtrl.delete,
    validate: {
        params: {
            id: Joi.number()
                .integer()
                .positive()
                .required()
                .description('The ID of the user')
        }
    }
};

// PUT /user/{id}
exports.update = {
    description: 'Update an existing user',
    pre: [AuthCtrl.authorize(Resources.USER)],
    handler: UserCtrl.update,
    validate: {
        payload: {
            id: Joi.forbidden(),
            username: Joi.string()
                .min(User.USERNAME_MIN_LENGTH)
                .max(User.USERNAME_MAX_LENGTH)
                .description('The username of the user'),
            name: Joi.string()
                .min(User.NAME_MIN_LENGTH)
                .max(User.NAME_MAX_LENGTH)
                .description('The real name of the user'),
            email: Joi.string()
                .email()
                .description('the email of the user'),
            password: Joi.string()
                .min(User.PASSWORD_MIN_LENGTH)
                .max(User.PASSWORD_MAX_LENGTH)
                .description('The password of the user'),
            avatar: Joi.string()
                .uri({
                    scheme: ['http', 'https'],
                    allowRelative: true
                })
                .description('The URI to the user avatar'),
            active: Joi.boolean().description('If the user is active'),
            roles: Joi.forbidden()
        }
    }
};
