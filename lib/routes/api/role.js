'use strict';

var Joi = require('joi');
var AuthCtrl = require('../../controllers/authorization');
var RoleCtrl = require('../../controllers/role');
var Role = require('../../models/role');
var User = require('../../models/user');
var Resource = require('../../models/resource');

var resource = 'role';

// GET /role
exports.list = {
    description: 'Lists available roles',
    pre: [AuthCtrl.authorize(resource)],
    handler: RoleCtrl.list
};

// GET /role/{id}
exports.get = {
    description: 'Get a specific role by ID',
    pre: [AuthCtrl.authorize(resource)],
    handler: RoleCtrl.get,
    validate: {
        params: {
            id: Joi.number().integer().required()
        }
    }
};

// POST /role
exports.create = {
    description: 'Adds a new role',
    pre: [AuthCtrl.authorize(resource)],
    handler: RoleCtrl.create,
    validate: {
        payload: {
            name: Joi.string().min(Role.NAME_MIN_LENGTH).max(Role.NAME_MAX_LENGTH).required()
        }
    }
};

// DELETE /role/{id}
exports.delete = {
    description: 'Delete an existing role',
    pre: [AuthCtrl.authorize(resource)],
    handler: RoleCtrl.delete,
    response: {
        emptyStatusCode: '204'
    },
    validate: {
        params: {
            id: Joi.number().integer().required()
        }
    }
};

// PUT /role/{id}
exports.update = {
    description: 'Update an existing role',
    pre: [AuthCtrl.authorize(resource)],
    handler: RoleCtrl.update,
    validate: {
        params: {
            id: Joi.number().integer().required()
        },
        payload: {
            id: Joi.forbidden(),
            name: Joi.string().min(Role.NAME_MIN_LENGTH).max(Role.NAME_MAX_LENGTH).required()
        }
    }
};

// PUT /role/{id}/users
exports.addUser = {
    description: 'Add user to an existing role',
    pre: [AuthCtrl.authorize(resource)],
    handler: RoleCtrl.addUser,
    validate: {
        params: {
            id: Joi.number().integer().required()
        },
        payload: Joi.object().keys({
            id: Joi.number().integer().required(),
            email: Joi.string().email(),
            password: Joi.string().min(User.PASSWORD_MIN_LENGTH).max(User.PASSWORD_MAX_LENGTH)
        })
    }
};

// PUT/role/{id}/permissions
exports.addPermission = {
    description: 'Add a permission to an existing role',
    pre: [AuthCtrl.authorize(resource)],
    handler: RoleCtrl.addPermission,
    validate: {
        params: {
            id: Joi.number().integer().required()
        },
        payload: Joi.object().keys({
            action: Joi.string().required(),
            resource: Joi.string().min(Resource.NAME_MIN_LENGTH).max(Resource.NAME_MAX_LENGTH)
        })
    }
};
