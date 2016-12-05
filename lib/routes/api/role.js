'use strict';

var Joi = require('joi');
var Role = require('../../models/role');
var User = require('../../models/user');
var RoleCtrl = require('../../controllers/role');

// GET /role
exports.list = {
    description: 'Lists available roles',
    handler: RoleCtrl.list,
    auth: {
        scope: 'admin'
    }
};

// GET /role/{id}
exports.get = {
    description: 'Get a specific role by ID',
    handler: RoleCtrl.get,
    auth: {
        scope: 'admin'
    },
    validate: {
        params: {
            id: Joi.number().integer().required()
        }
    }
};

// POST /role
exports.create = {
    description: 'Adds a new role',
    handler: RoleCtrl.create,
    auth: {
        scope: 'admin'
    },
    validate: {
        payload: {
            name: Joi.string().min(Role.NAME_MIN_LENGTH).max(Role.NAME_MAX_LENGTH).required()
        }
    }
};

// DELETE /role/{id}
exports.delete = {
    description: 'Delete an existing role',
    handler: RoleCtrl.delete,
    auth: {
        scope: 'admin'
    },
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
    handler: RoleCtrl.update,
    auth: {
        scope: 'admin'
    },
    validate: {
        params: {
            id: Joi.number().integer().required()
        },
        payload: {
            name: Joi.string().min(Role.NAME_MIN_LENGTH).max(Role.NAME_MAX_LENGTH).required()
        }
    }
};

// PUT /role/{id}/users
exports.addUser = {
    description: 'Add user to an existing role',
    handler: RoleCtrl.addUser,
    auth: {
        scope: 'admin'
    },
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
