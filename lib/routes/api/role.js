var Joi = require('joi');
var AuthCtrl = require('../../controllers/authorization');
var RoleCtrl = require('../../controllers/api/role');
var Role = require('../../models/role');
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

//DELETE /role/{id}/users
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

// DELETE/role/{id}/permissions
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
