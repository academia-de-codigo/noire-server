/**
 * Static Roles
 * @module
 */
const internals = {};

/**
 * Enum with static roles that should always be available
 * @type {Object}
 */
internals.roles = {
    ADMIN: 'admin',
    GUEST: 'guest'
};

module.exports = internals.roles;
