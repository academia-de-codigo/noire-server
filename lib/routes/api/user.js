'use strict';

var Joi = require('joi');
var AuthCtrl = require('../../controllers/authorization');
var UserCtrl = require('../../controllers/user');
var User = require('../../models/user');

var resource = 'user';

// GET /user
exports.list = {
    description: 'Lists available users',
    pre: [AuthCtrl.authorize(resource)],
    handler: UserCtrl.list
};

// GET /user/{id}
exports.get = {
    description: 'Get a specific user by ID',
    pre: [
        AuthCtrl.authorize(resource)
    ],
    handler: UserCtrl.get,
    validate: {
        params: {
            id: Joi.number().integer().required()
        }
    }
};

// POST /user
exports.create = {
    description: 'Adds a new user',
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
