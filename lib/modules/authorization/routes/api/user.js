/**
 * Api user resource routes
 */
const Joi = require('joi');
const Path = require('path');
const AuthCtrl = require(Path.join(process.cwd(), 'lib/modules/authorization/controllers/authorization'));
const UserCtrl = require(Path.join(process.cwd(), 'lib/modules/authorization/controllers/api/user'));
const User = require(Path.join(process.cwd(), 'lib/models/user'));

const resource = 'user';

// GET /user
exports.list = {
    description: 'Lists available users',
    pre: [AuthCtrl.authorize(resource)],
    handler: UserCtrl.list,
    validate: {
        query: {
            limit: Joi.number().integer().min(1).max(100),
            page: Joi.number().integer().positive(),
            search: Joi.string(),
            sort: Joi.string(),
            descending: Joi.boolean()
        }
    }
};

// GET /user/{id}
exports.get = {
    description: 'Get user by ID',
    pre: [AuthCtrl.authorize(resource)],
    handler: UserCtrl.get,
    validate: {
        params: {
            id: Joi.number().integer().required()
        }
    }
};

// POST /user
exports.create = {
    description: 'Add a new user',
    pre: [AuthCtrl.authorize(resource)],
    handler: UserCtrl.create,
    validate: {
        payload: {
            username: Joi.string().min(User.USERNAME_MIN_LENGTH).max(User.USERNAME_MAX_LENGTH).required(),
            name: Joi.string().min(User.NAME_MIN_LENGTH).max(User.NAME_MAX_LENGTH).required(),
            email: Joi.string().email().required(),
            password: Joi.string().min(User.PASSWORD_MIN_LENGTH).max(User.PASSWORD_MAX_LENGTH).required(),
        }
    }
};


// DELETE /user/{id}
exports.delete = {
    description: 'Delete an existing user',
    pre: [AuthCtrl.authorize(resource)],
    handler: UserCtrl.delete,
    validate: {
        params: {
            id: Joi.number().integer().required()
        }
    }
};

// PUT /user/{id}
exports.update = {
    description: 'Update an existing user',
    pre: [AuthCtrl.authorize(resource)],
    handler: UserCtrl.update,
    validate: {
        payload: {
            id: Joi.forbidden(),
            username: Joi.string().min(User.USERNAME_MIN_LENGTH).max(User.USERNAME_MAX_LENGTH),
            name: Joi.string().min(User.NAME_MIN_LENGTH).max(User.NAME_MAX_LENGTH),
            email: Joi.string().email(),
            password: Joi.string().min(User.PASSWORD_MIN_LENGTH).max(User.PASSWORD_MAX_LENGTH),
            active: Joi.boolean(),
            roles: Joi.forbidden()
        }
    }
};
