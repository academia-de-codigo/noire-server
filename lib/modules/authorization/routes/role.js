/**
 * Api role routes
 */
const Joi = require('@hapi/joi');
const AuthCtrl = require('modules/authorization/controllers/authorization');
const RoleCtrl = require('modules/authorization/controllers/role');
const Role = require('models/authorization/role');
const Permission = require('models/authorization/permission');
const Resource = require('models/authorization/resource');
const Resources = require('enums/resources');
const Actions = require('enums/actions');
const { documentationTags } = require('config');

const tags = documentationTags.authorization;

// GET /role
exports.list = {
    description: 'Lists available roles',
    pre: [AuthCtrl.authorize(Resources.ROLE, Actions.LIST)],
    handler: RoleCtrl.list,
    tags,
    validate: {
        query: Joi.object({
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
        })
    }
};

// GET /role/{id}
exports.get = {
    description: 'Get role by ID',
    pre: [AuthCtrl.authorize(Resources.ROLE)],
    handler: RoleCtrl.get,
    tags,
    validate: {
        params: Joi.object({
            id: Joi.number()
                .integer()
                .positive()
                .required()
                .description('The ID of the role')
        })
    }
};

// POST /role
exports.create = {
    description: 'Adds a new role',
    pre: [AuthCtrl.authorize(Resources.ROLE)],
    handler: RoleCtrl.create,
    tags,
    validate: {
        payload: Joi.object({
            name: Joi.string()
                .min(Role.NAME_MIN_LENGTH)
                .max(Role.NAME_MAX_LENGTH)
                .required()
                .description('The name of the tole'),
            description: Joi.string()
                .max(Role.DESC_MAX_LENGTH)
                .description('The description of the role')
        })
    }
};

// DELETE /role/{id}
exports.delete = {
    description: 'Delete an existing role',
    pre: [AuthCtrl.authorize(Resources.ROLE)],
    handler: RoleCtrl.delete,
    tags,
    validate: {
        params: Joi.object({
            id: Joi.number()
                .integer()
                .positive()
                .required()
                .description('The ID of the role')
        })
    }
};

// PUT /role/{id}
exports.update = {
    description: 'Update an existing role',
    pre: [AuthCtrl.authorize(Resources.ROLE)],
    handler: RoleCtrl.update,
    tags,
    validate: {
        params: Joi.object({
            id: Joi.number()
                .integer()
                .required()
                .description('The id of the role')
        }),
        payload: Joi.object({
            id: Joi.forbidden(),
            name: Joi.string()
                .min(Role.NAME_MIN_LENGTH)
                .max(Role.NAME_MAX_LENGTH)
                .description('The name of the role'),
            description: Joi.string()
                .max(Role.DESC_MAX_LENGTH)
                .description('The description of the role')
        })
    }
};

// PUT /role/{id}/users
exports.addUsers = {
    description: 'Add users to an existing role',
    pre: [AuthCtrl.authorize(Resources.ROLE)],
    handler: RoleCtrl.addUsers,
    tags,
    validate: {
        params: Joi.object({
            id: Joi.number()
                .integer()
                .required()
                .description('The ID of the role')
        }),
        payload: Joi.object({
            id: Joi.alternatives([
                Joi.array()
                    .items(
                        Joi.number()
                            .integer()
                            .required()
                            .description('The ids of the users to add to this role')
                    )
                    .unique(),
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
    tags,
    validate: {
        params: Joi.object({
            id: Joi.number()
                .integer()
                .required()
                .description('The role ID')
        }),
        payload: Joi.object({
            id: Joi.alternatives([
                Joi.array()
                    .items(
                        Joi.number()
                            .integer()
                            .positive()
                            .required()
                            .description('The id of the users to remove from this role')
                    )
                    .unique(),
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
    tags,
    validate: {
        params: Joi.object({
            id: Joi.number()
                .integer()
                .positive()
                .required()
                .description('The ID of the role')
        }),
        payload: Joi.object({
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
    tags,
    validate: {
        params: Joi.object({
            id: Joi.number()
                .integer()
                .positive()
                .required()
                .description('The ID of the Role')
        }),
        payload: Joi.object({
            id: Joi.array()
                .items(
                    Joi.number()
                        .integer()
                        .positive()
                        .required()
                        .description('The id of the permissions to add or keep in this role')
                )
                .unique()
        })
    }
};
