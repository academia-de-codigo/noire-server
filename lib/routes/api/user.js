'use strict';

var Joi = require('joi');
var UserCtrl = require('../../controllers/user');
var User = require('../../models/user');

// GET /user
exports.list = {
    description: 'Lists available users',
    handler: UserCtrl.list,
    auth: {
        scope: 'admin'
    }
};

// GET /user/{id}
exports.get = {
    description: 'Get a specific user by ID',
    handler: UserCtrl.get,
    auth: {
        scope: 'admin'
    },
    validate: {
        params: {
            id: Joi.number().integer().required()
        }
    }
};

// POST /user
exports.create = {
    description: 'Adds a new user',
    handler: UserCtrl.create,
    auth: {
        scope: 'admin'
    },
    validate: {
        payload: {
            username: Joi.string().min(User.USERNAME_MIN_LENGTH).max(User.USERNAME_MAX_LENGTH).required(),
            email: Joi.string().email().required(),
            password: Joi.string().min(User.PASSWORD_MIN_LENGTH).max(User.PASSWORD_MAX_LENGTH).required()
        }
    }
};
