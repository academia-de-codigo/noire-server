'use strict';

var Joi = require('joi');
var UserCtrl = require('../../controllers/user');

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
