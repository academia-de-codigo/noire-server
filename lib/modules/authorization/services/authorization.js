/**
 * Authorization service
 * @module
 */
const UserService = require('modules/authorization/services/user');
const RoleService = require('modules/authorization/services/role');
const ResourceService = require('modules/authorization/services/resource');
const NSError = require('errors/nserror');

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

    if (!user) {
        throw NSError.RESOURCE_NOT_FOUND();
    }

    if (!user.roles) {
        return false;
    }

    // How cool would be to use this functional style?
    // return user.roles.some(async role => await exports.canRole(role.name, action, resourceName));
    // Native promises do not support Promise.some and array methods do not know how to await...

    // imperitive way of looking for a role with the procer access rights
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

    if (!role || !resource) {
        throw NSError.RESOURCE_NOT_FOUND();
    }

    // look for permission with provided action pointing to specificed resource
    const permissions = await role
        .$relatedQuery('permissions')
        .eager('resource')
        .where('action', action)
        .andWhere('resource_id', resource.id);

    return permissions && permissions.length > 0;
};
