/**
 * Api role routes
 */
const Joi = require('joi');
const AuthCtrl = require('modules/authorization/controllers/authorization');
const RoleCtrl = require('modules/authorization/controllers/api/role');
const Permission = require('models/permission');
const Role = require('models/role');
const Resource = require('models/resource');
const Resources = require('enums/resources');
const Actions = require('enums/actions');

// GET /role
exports.list = {
    description: 'Lists available roles',
    pre: [AuthCtrl.authorize(Resources.ROLE, Actions.LIST)],
    handler: RoleCtrl.list,
    validate: {
        query: {
            limit: Joi.number()
                .integer()
                .min(1)
                .max(100)
                .description('The limit of roles to get'),
            page: Joi.number()
                .integer()
                .positive()
                .description('The page to get the roles from'),
            search: Joi.string().description('The search criteria'),
            sort: Joi.string().description('The sorting order')
        }
    }
};

// GET /role/{id}
exports.get = {
    description: 'Get role by ID',
    pre: [AuthCtrl.authorize(Resources.ROLE)],
    handler: RoleCtrl.get,
    validate: {
        params: {
            id: Joi.number()
                .integer()
                .positive()
                .required()
                .description('The ID of the role')
        }
    }
};

// POST /role
exports.create = {
    description: 'Adds a new role',
    pre: [AuthCtrl.authorize(Resources.ROLE)],
    handler: RoleCtrl.create,
    validate: {
        payload: {
            name: Joi.string()
                .min(Role.NAME_MIN_LENGTH)
                .max(Role.NAME_MAX_LENGTH)
                .required()
                .description('The name of the tole'),
            description: Joi.string()
                .max(Role.DESC_MAX_LENGTH)
                .description('The description of the role')
        }
    }
};

// DELETE /role/{id}
exports.delete = {
    description: 'Delete an existing role',
    pre: [AuthCtrl.authorize(Resources.ROLE)],
    handler: RoleCtrl.delete,
    validate: {
        params: {
            id: Joi.number()
                .integer()
                .positive()
                .required()
                .description('The ID of the role')
        }
    }
};

// PUT /role/{id}
exports.update = {
    description: 'Update an existing role',
    pre: [AuthCtrl.authorize(Resources.ROLE)],
    handler: RoleCtrl.update,
    validate: {
        params: {
            id: Joi.number()
                .integer()
                .required()
                .description('The id of the role')
        },
        payload: {
            id: Joi.forbidden(),
            name: Joi.string()
                .min(Role.NAME_MIN_LENGTH)
                .max(Role.NAME_MAX_LENGTH)
                .description('The name of the role'),
            description: Joi.string()
                .max(Role.DESC_MAX_LENGTH)
                .description('The description of the role')
        }
    }
};

// PUT /role/{id}/users
exports.addUsers = {
    description: 'Add users to an existing role',
    pre: [AuthCtrl.authorize(Resources.ROLE)],
    handler: RoleCtrl.addUsers,
    validate: {
        params: {
            id: Joi.number()
                .integer()
                .required()
                .description('The ID of the role')
        },
        payload: Joi.object().keys({
            id: Joi.alternatives([
                Joi.array().items(
                    Joi.number()
                        .integer()
                        .required()
                        .description('The ids of the users to add to this role')
                ).unique(),
                Joi.number()
                    .integer()
                    .positive()
                    .description('The id of a user to add to this role')
            ]).required()
        })
    }
};

// DELETE /role/{id}/users
exports.removeUsers = {
    description: 'Remove users from a role',
    pre: [AuthCtrl.authorize(Resources.ROLE)],
    handler: RoleCtrl.removeUsers,
    validate: {
        params: {
            id: Joi.number()
                .integer()
                .required()
                .description('The role ID')
        },
        payload: Joi.object().keys({
            id: Joi.alternatives([
                Joi.array().items(
                    Joi.number()
                        .integer()
                        .positive()
                        .required()
                        .description('The id of the users to remove from this role')
                ).unique(),
                Joi.number()
                    .integer()
                    .positive()
                    .description('The id of a user to remove from this role')
            ]).required()
        })
    }
};

// POST /role/{id}/permissions
exports.addPermission = {
    description: 'Add a permission to an existing role',
    pre: [AuthCtrl.authorize(Resources.ROLE)],
    handler: RoleCtrl.addPermission,
    validate: {
        params: {
            id: Joi.number()
                .integer()
                .positive()
                .required()
                .description('The ID of the role')
        },
        payload: Joi.object().keys({
            action: Joi.string()
                .required()
                .description('The action associated to the permission'),
            resource: Joi.string()
                .min(Resource.NAME_MIN_LENGTH)
                .max(Resource.NAME_MAX_LENGTH)
                .description('The Resource that permission refers to'),
            description: Joi.string()
                .max(Permission.DESCRIPTION_MAX_LENGTH)
                .description('The permission description')
        })
    }
};

// PUT /role/{id}/permissions
exports.updatePermissions = {
    description: 'Update role permissions',
    pre: [AuthCtrl.authorize(Resources.ROLE)],
    handler: RoleCtrl.updatePermissions,
    validate: {
        params: {
            id: Joi.number()
                .integer()
                .positive()
                .required()
                .description('The ID of the Role')
        },
        payload: Joi.object().keys({
            id: Joi.array().items(
                Joi.number()
                    .integer()
                    .positive()
                    .required()
                    .description('The id of the permissions to add or keep in this role')
            ).unique()
        })
    }
};
