/**
 * Api role resource routes
 */
const Joi = require('joi');
const Path = require('path');
const AuthCtrl = require(Path.join(process.cwd(), 'lib/modules/authorization/controllers/authorization'));
const RoleCtrl = require(Path.join(process.cwd(), 'lib/modules/authorization/controllers/api/role'));
const Role = require(Path.join(process.cwd(), 'lib/models/role'));
const Resource = require(Path.join(process.cwd(), 'lib/models/resource'));

const resource = 'role';

// GET /role
exports.list = {
    description: 'Lists available roles',
    pre: [AuthCtrl.authorize(resource)],
    handler: RoleCtrl.list,
    validate: {
        query: {
            limit: Joi.number().integer().default(10).min(1).max(100),
            page: Joi.number().integer().positive(),
            search: Joi.string(),
            sort: Joi.string(),
            descending: Joi.boolean()
        }
    }
};

// GET /role/{id}
exports.get = {
    description: 'Get role by ID',
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
            name: Joi.string().min(Role.NAME_MIN_LENGTH).max(Role.NAME_MAX_LENGTH).required(),
            description: Joi.string().max(Role.DESC_MAX_LENGTH)
        }
    }
};

// DELETE /role/{id}
exports.delete = {
    description: 'Delete an existing role',
    pre: [AuthCtrl.authorize(resource)],
    handler: RoleCtrl.delete,
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
            name: Joi.string().min(Role.NAME_MIN_LENGTH).max(Role.NAME_MAX_LENGTH),
            description: Joi.string().max(Role.DESC_MAX_LENGTH)
        }
    }
};

// PUT /role/{id}/users
exports.addUsers = {
    description: 'Add users to an existing role',
    pre: [AuthCtrl.authorize(resource)],
    handler: RoleCtrl.addUsers,
    validate: {
        params: {
            id: Joi.number().integer().required()
        },
        payload: Joi.object().keys({
            id: Joi.alternatives([
                Joi.array().items(Joi.number().integer().required()),
                Joi.number().integer()
            ]).required()

        })
    }
};

// DELETE /role/{id}/users
exports.removeUsers = {
    description: 'Remove users from a role',
    pre: [AuthCtrl.authorize(resource)],
    handler: RoleCtrl.removeUsers,
    validate: {
        params: {
            id: Joi.number().integer().required()
        },
        payload: Joi.object().keys({
            id: Joi.alternatives([
                Joi.array().items(Joi.number().integer().required()),
                Joi.number().integer()
            ]).required()
        })
    }
};

// PUT /role/{id}/permissions
exports.addPermission = {
    description: 'Add a permission to an existing role',
    pre: [AuthCtrl.authorize(resource)],
    handler: RoleCtrl.addPermissions,
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

// DELETE /role/{id}/permissions
exports.removePermissions = {
    description: 'Remove permissions from a role',
    pre: [AuthCtrl.authorize(resource)],
    handler: RoleCtrl.removePermissions,
    validate: {
        params: {
            id: Joi.number().integer().required()
        },
        payload: Joi.object().keys({
            id: Joi.alternatives([
                Joi.array().items(Joi.number().integer().required()),
                Joi.number().integer()
            ]).required()
        })
    }
};
