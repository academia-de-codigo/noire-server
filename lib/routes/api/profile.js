'use strict';

var Joi = require('joi');
var ProfileCtrl = require('../../controllers/api/profile');
var User = require('../../models/user');

// GET /profile
exports.get = {
    description: 'Get the user profile',
    handler: ProfileCtrl.get,
};

// PUT /profile
exports.update = {
    description: 'Update the user profile',
    handler: ProfileCtrl.update,
    validate: {
        payload: {
            username: Joi.string().min(User.USERNAME_MIN_LENGTH).max(User.USERNAME_MAX_LENGTH),
            name: Joi.string().min(User.NAME_MIN_LENGTH).max(User.NAME_MAX_LENGTH),
            email: Joi.string().email(),
            password: Joi.string().min(User.PASSWORD_MIN_LENGTH).max(User.PASSWORD_MAX_LENGTH),
            roles: Joi.forbidden(),
            active: Joi.forbidden()
        }
    }
};
