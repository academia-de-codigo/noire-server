var Joi = require('joi');
var User = require('../../../../models/user');
var UserCtrl = require('../../controllers/api/user');
var AuthCtrl = require('../../controllers/auth');

var resource = 'user';

exports.update = {
    description: 'Update a specific user by ID',
    pre: [AuthCtrl.authorize(resource)],
    handler: UserCtrl.update,
    validate: {
        payload: {
            username: Joi.string().min(User.USERNAME_MIN_LENGTH).max(User.USERNAME_MAX_LENGTH).required(),
            active: Joi.boolean(),

        }
    }
};

exports.get = {
    description: 'Gets a specific user by ID',
    pre: [AuthCtrl.authorize(resource)],
    handler: UserCtrl.get,
    validate: {
        params: {
            id: Joi.number().integer().required()
        }
    }
};

exports.delete = {
    description: 'Deletes an existing user',
    pre: [AuthCtrl.authorize(resource)],
    handler: UserCtrl.delete,
    response: {
        emptyStatusCode: '204'
    },
    validate: {
        params: {
            id: Joi.number().integer().required()
        }
    }
};
