/**
 * Authorization service
 * @module
 */
const Hoek = require('hoek');
const UserService = require('modules/authorization/services/user');
const RoleService = require('modules/authorization/services/role');
const ResourceService = require('modules/authorization/services/resource');

/**
 * Gets if a user has the required authorization to perform a
 * specific action on a given resource
 * @async
 * @param {any} username the user name
 * @param {any} action the action
 * @param {any} resourceName the resource name
 * @returns {boolean} true if authorized
 */
exports.canUser = async function(username, action, resourceName) {
    const user = await UserService.findByUserName(username);

    Hoek.assert(user.roles instanceof Array, 'user entity should contain roles relation');

    // How cool would be to use this functional style?
    // return user.roles.some(async role => await exports.canRole(role.name, action, resourceName));
    // Native promises do not support Promise.some and array methods do not know how to await...

    // imperative way of looking for a role with the proper access rights
    for (let i = 0; i < user.roles.length; i++) {
        if (await exports.canRole(user.roles[i].name, action, resourceName)) {
            return true;
        }
    }

    return false;
};

/**
 * Gets if a role has the required authorization to perform a
 * specific action on a given resource
 * @async
 * @param {string} roleName the role name
 * @param {string} action the action
 * @param {string} resourceName the resource name
 * @returns {boolean} true if authorized
 */
exports.canRole = async function(roleName, action, resourceName) {
    const getRole = RoleService.findByName(roleName);
    const getResource = ResourceService.findByName(resourceName);

    const [role, resource] = await Promise.all([getRole, getResource]);

    // look for permission with provided action pointing to specified resource
    const permissions = await role
        .$relatedQuery('permissions')
        .eager('resource')
        .where('action', action)
        .andWhere('resource_id', resource.id);

    Hoek.assert(permissions instanceof Array, 'role entity should contain permissions relation');

    return permissions.length > 0;
};
