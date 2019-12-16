/**
 * Resource Actions
 * @module
 */

/**
 * Enum with possible actions to perform on a resource
 * @type {Object}
 */
const actions = {
    CREATE: 'create',
    READ: 'read',
    UPDATE: 'update',
    DELETE: 'delete',
    LIST: 'list'
};

Object.freeze(actions);

module.exports = actions;
