/**
 * Static Roles
 * @module
 */

/**
 * Enum with static roles that should always be available
 * @type {Object}
 */
const roles = {
    ADMIN: 'admin',
    GUEST: 'guest'
};

Object.freeze(roles);

module.exports = roles;
