/**
 * API role routes
 * @module
 */
const AuthCtrl = require('modules/authorization/controllers/authorization');
const RoleCtrl = require('modules/authorization/controllers/role');
const Resources = require('enums/resources');
const Actions = require('enums/actions');
const Validator = require('modules/authorization/validators/role');
const { documentationTags } = require('config');

const tags = documentationTags.authorization;

const descriptions = {
    id: 'The ID of the role',
    query: [
        'The limit of roles to get',
        'The page to get the roles from',
        'The search criteria',
        'The sorting order'
    ],
    role: ['The name of the role', 'The description of the role'],
    usersToRole: [
        'The ids of the users to add to this role',
        'The id of a user to add to this role'
    ],
    usersFromRole: [
        'The ids of the users to remove from this role',
        'The id of a user to remove from this role'
    ],
    addPermission: [
        'The action associated to the permission',
        'The Resource that permission refers to',
        'The permission description'
    ],
    updatePermission: 'The id of the permissions to add or keep in this role'
};

// GET /role
exports.list = {
    description: 'Lists available roles',
    pre: [AuthCtrl.authorize(Resources.ROLE, Actions.LIST)],
    handler: RoleCtrl.list,
    tags,
    validate: {
        query: Validator.validateQueryParams(...descriptions.query)
    }
};

// GET /role/{id}
exports.get = {
    description: 'Get role by ID',
    pre: [AuthCtrl.authorize(Resources.ROLE)],
    handler: RoleCtrl.get,
    tags,
    validate: {
        params: Validator.validateRequiredId(descriptions.id)
    }
};

// POST /role
exports.create = {
    description: 'Adds a new role',
    pre: [AuthCtrl.authorize(Resources.ROLE)],
    handler: RoleCtrl.create,
    tags,
    validate: {
        payload: Validator.validateRoleCreationFields(...descriptions.role)
    }
};

// DELETE /role/{id}
exports.delete = {
    description: 'Delete an existing role',
    pre: [AuthCtrl.authorize(Resources.ROLE)],
    handler: RoleCtrl.delete,
    tags,
    validate: {
        params: Validator.validateRequiredId(descriptions.id)
    }
};

// PUT /role/{id}
exports.update = {
    description: 'Update an existing role',
    pre: [AuthCtrl.authorize(Resources.ROLE)],
    handler: RoleCtrl.update,
    tags,
    validate: {
        params: Validator.validateRequiredId(descriptions.id),
        payload: Validator.validateRoleUpdateFields(...descriptions.role)
    }
};

// PUT /role/{id}/users
exports.addUsers = {
    description: 'Add users to an existing role',
    pre: [AuthCtrl.authorize(Resources.ROLE)],
    handler: RoleCtrl.addUsers,
    tags,
    validate: {
        params: Validator.validateRequiredId(descriptions.id),
        payload: Validator.validateArrayOfIdsOrSingleId(...descriptions.usersToRole)
    }
};

// DELETE /role/{id}/users
exports.removeUsers = {
    description: 'Remove users from a role',
    pre: [AuthCtrl.authorize(Resources.ROLE)],
    handler: RoleCtrl.removeUsers,
    tags,
    validate: {
        params: Validator.validateRequiredId(descriptions.id),
        payload: Validator.validateArrayOfIdsOrSingleId(...descriptions.usersFromRole)
    }
};

// POST /role/{id}/permissions
exports.addPermission = {
    description: 'Add a permission to an existing role',
    pre: [AuthCtrl.authorize(Resources.ROLE)],
    handler: RoleCtrl.addPermission,
    tags,
    validate: {
        params: Validator.validateRequiredId(descriptions.id),
        payload: Validator.validateAddingPermission(...descriptions.addPermission)
    }
};

// PUT /role/{id}/permissions
exports.updatePermissions = {
    description: 'Update role permissions',
    pre: [AuthCtrl.authorize(Resources.ROLE)],
    handler: RoleCtrl.updatePermissions,
    tags,
    validate: {
        params: Validator.validateRequiredId(descriptions.id),
        payload: Validator.validateArrayOfRequiredIds(descriptions.updatePermission)
    }
};
