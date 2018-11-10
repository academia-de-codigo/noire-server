/**
 * Resource Actions
 * @module
 */
const internals = {};

/**
 * Enum with possible actions to perform on a resource
 * @type {Object}
 */
internals.actions = {
    CREATE: 'create',
    READ: 'read',
    UPDATE: 'update',
    DELETE: 'delete',
    LIST: 'list'
};

module.exports = internals.actions;
