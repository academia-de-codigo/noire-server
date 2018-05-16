/**
 * Role Service
 * @module
 */
const Hoek = require('hoek');
const NSError = require('errors/nserror');
const Repository = require('plugins/repository');
const Action = require('utils/action');

/**
 * Counts the number of roles
 * @async
 * @param {Object} [criteria] search criteria
 * @returns {Promise<number>} the number of roles
 */
exports.count = async function(criteria) {
    return (await Repository.role.count(criteria)).count;
};

/**
 * Retrieves all roles
 * @param {(number|string|Object)} [criteria] search criteria
 * @returns {Promise<Role[]>} all retrieved roles
 */
exports.list = function(criteria) {
    return Repository.role.findAll(criteria);
};

/**
 * Retrieves a role by its id
 * @async
 * @param {number} id the role id
 * @returns {Promise<Role>} the retrieved role
 */
exports.findById = async function(id) {
    const role = await Repository.role.findOne(id).eager('permissions');

    if (!role) {
        throw NSError.RESOURCE_NOT_FOUND();
    }

    return role;
};

/**
 * Retrieves a role by its name
 * @async
 * @param {string} name the role name
 * @returns {Promise<Role>} the retrieved role
 */
exports.findByName = async function(name) {
    const role = await Repository.role.query().findOne({ name });

    if (!role) {
        throw NSError.RESOURCE_NOT_FOUND();
    }

    return role;
};

/**
 * Saves a role
 * @param {Role} entity the role to save
 * @returns {Promise<Role>} the saved role
 */
exports.add = function(entity) {
    // transaction protects against duplicates caused by simultaneous add
    return Repository.tx(Repository.role.model, async txRoleRepository => {
        const role = await txRoleRepository.query().findOne({ name: entity.name });

        if (role) {
            throw NSError.RESOURCE_DUPLICATE();
        }

        return txRoleRepository.add(entity);
    });
};

/**
 * Removes a role
 * @param {number} id the role id
 * @returns {Promise} resolved if the transaction was committed with success
 */
exports.delete = function(id) {
    return Repository.tx(Repository.role.model, async txRoleRepository => {
        const role = await txRoleRepository.findOne(id).eager('permissions');

        if (!role) {
            throw NSError.RESOURCE_NOT_FOUND();
        }

        // we only need to know if there are any users associated with the role, not the users itself
        const userCount = await role.$relatedQuery('users').resultSize();

        // in Postgresql count returns a String and not a Number
        if (Number.parseInt(userCount)) {
            throw NSError.RESOURCE_RELATION();
        }

        // removes all relations with this role's permissions
        if (role.permissions.length) {
            await Promise.all(
                role.permissions.map(permission =>
                    role
                        .$relatedQuery('permissions')
                        .unrelate()
                        .where('id', permission.id)
                )
            );
        }

        const count = await txRoleRepository.remove(id);

        if (count !== 1) {
            throw NSError.RESOURCE_DELETE();
        }

        return;
    });
};

/**
 * Updates an existing role
 * @param {number} id the id of the role to update
 * @param {Role} entity the role to update
 * @returns {Promise<Resource>} the updated role
 */
exports.update = function(id, entity) {
    return Repository.tx(Repository.role.model, async txRoleRepository => {
        const getRoleById = txRoleRepository.findOne(id);
        const getEqualRoles = entity.name
            ? txRoleRepository
                  .query()
                  .skipUndefined()
                  .where('name', entity.name)
            : Promise.resolve([]);

        const [role, equalRoles] = await Promise.all([getRoleById, getEqualRoles]);

        if (!role) {
            throw NSError.RESOURCE_NOT_FOUND();
        }

        if (equalRoles.length > 0 && equalRoles[0].id !== id) {
            throw NSError.RESOURCE_DUPLICATE();
        }

        Hoek.merge(role, Hoek.cloneWithShallow(entity, ['name', 'description']));
        return txRoleRepository.update(role);
    });
};

/**
 * Associates multiple users with a role
 * @param {number} id the id of the role
 * @param {(number|number[])} userIds the ids of the users
 * @returns {Promise<Object>} the added user role mappings
 */
exports.addUsers = function(id, userIds) {
    userIds = Array.isArray(userIds) ? userIds : [userIds];

    return Repository.tx(
        Repository.role.model,
        Repository.user.model,
        async (txRoleRepository, txUserRepository) => {
            const role = await txRoleRepository.findOne(id);

            if (!role) {
                throw NSError.RESOURCE_NOT_FOUND('Invalid role id');
            }

            const getUsersById = userIds.map(userId =>
                txUserRepository.findOne(userId).eager('roles')
            );
            const users = await Promise.all(getUsersById);

            // make sure all the users exist
            if (users.some(user => !user)) {
                throw NSError.RESOURCE_NOT_FOUND('Invalid user id');
            }

            // make sure no user already contains the role
            users.forEach(user => {
                Hoek.assert(
                    user.roles instanceof Array,
                    'user entity should contain relation to roles'
                );

                if (user.roles.some(userRole => userRole.id === role.id)) {
                    throw NSError.RESOURCE_DUPLICATE();
                }
            });

            return Promise.all(userIds.map(userId => role.$relatedQuery('users').relate(userId)));
        }
    );
};

/**
 * Remove the association between users and a role
 * @param {string} id the id of the role
 * @param {(number|number[])} userIds the ids of the users
 * @returns {Promise<(number|number[])>} the number of unrelated rows
 */
exports.removeUsers = function(id, userIds) {
    userIds = Array.isArray(userIds) ? userIds : [userIds];

    return Repository.tx(
        Repository.role.model,
        Repository.user.model,
        async (txRoleRepository, txUserRepository) => {
            const role = await txRoleRepository.findOne(id).eager('users');

            if (!role) {
                throw NSError.RESOURCE_NOT_FOUND('Invalid role id');
            }

            const getUsersById = userIds.map(userId => txUserRepository.findOne(userId));
            const users = await Promise.all(getUsersById);

            // make sure all users exist
            if (users.some(user => !user)) {
                throw NSError.RESOURCE_NOT_FOUND('Invalid user id');
            }

            // check if all users are in role
            const userNotInRole = userIds.some(userId => {
                return role.users.map(roleUser => roleUser.id).indexOf(userId) === -1;
            });

            if (userNotInRole) {
                throw NSError.RESOURCE_NOT_FOUND('User not in role');
            }

            return Promise.all(
                userIds.map(userId =>
                    role
                        .$relatedQuery('users')
                        .unrelate()
                        .where('id', userId)
                )
            );
        }
    );
};

/**
 * Adds a permission to a role
 * @param {number} id the id of the role
 * @param {Action} action the permission action
 * @param {string} resourceName the permission resource
 * @returns {Promise<Object>} the added role permission mappings
 */
exports.addPermissions = function(id, action, resourceName) {
    if (!Action.isAction(action)) {
        throw NSError.RESOURCE_NOT_FOUND();
    }

    return Repository.tx(
        Repository.role.model,
        Repository.permission.model,
        Repository.resource.model,
        async (txRoleRepository, txPermissionRepository, txResourceRepository) => {
            const getRoleById = txRoleRepository.findOne(id).eager('permissions');
            const getResourceByName = txResourceRepository.query().findOne({ name: resourceName });

            const [role, resource] = await Promise.all([getRoleById, getResourceByName]);

            if (!role) {
                throw NSError.RESOURCE_NOT_FOUND('Invalid role id');
            }

            if (!resource) {
                throw NSError.RESOURCE_NOT_FOUND('Invalid resource id');
            }

            let permission = await txPermissionRepository
                .query()
                .where('action', action)
                .andWhere('resource_id', resource.id)
                .first();

            if (!permission) {
                // permission does not exist and we need to create a new one
                permission = await txPermissionRepository.add({
                    action: action,
                    resource_id: resource.id
                });
            }

            // role already contains the permission
            if (role.permissions.some(rolePermission => rolePermission.id === permission.id)) {
                throw NSError.RESOURCE_DUPLICATE();
            }

            return role.$relatedQuery('permissions').relate(permission.id);
        }
    );
};

/**
 * Remove permissions from role
 * @param {number} id the id of the role
 * @param {(number|number[])} permissionIds the ids of the permissions
 * @returns {Promise<(number|number[])>} the number of unrelated rows
 */
exports.removePermissions = function(id, permissionIds) {
    permissionIds = Array.isArray(permissionIds) ? permissionIds : [permissionIds];

    return Repository.tx(
        Repository.role.model,
        Repository.permission.model,
        async (txRoleRepository, txPermissionRepository) => {
            const role = await txRoleRepository.findOne(id).eager('permissions');

            if (!role) {
                throw NSError.RESOURCE_NOT_FOUND('Invalid role id');
            }

            const getPermissionsById = permissionIds.map(permissionId => {
                return txPermissionRepository.findOne(permissionId);
            });
            const permissions = await Promise.all(getPermissionsById);

            // check if permission exists
            if (permissions.some(permission => !permission)) {
                throw NSError.RESOURCE_NOT_FOUND('Invalid permission id');
            }

            let roleHasPermission = permissionIds.some(permId => {
                return (
                    role.permissions.map(rolePermission => rolePermission.id).indexOf(permId) === -1
                );
            });

            if (roleHasPermission) {
                throw NSError.RESOURCE_NOT_FOUND('Permission not in role');
            }

            // Remove permission from role, but do not remove permissions
            return Promise.all(
                permissionIds.map(permissionId =>
                    role
                        .$relatedQuery('permissions')
                        .unrelate()
                        .where('id', permissionId)
                )
            );
        }
    );
};
