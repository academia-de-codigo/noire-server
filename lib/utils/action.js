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

/**
 * Hash mapping http methods to actions
 * @type {Object}
 */
internals.methods = {
    get: internals.actions.READ,
    post: internals.actions.CREATE,
    put: internals.actions.UPDATE,
    delete: internals.actions.DELETE
};

module.exports = internals.actions;

/**
 * Gets the resource action for the corresponding http method
 * @param  {String} method the http method
 * @return {String} The resource action
 */
module.exports.getByHttpMethod = function(method) {
    return internals.methods[method];
};

/**
 * Gets if its a valid action
 * @param {string} action the action to validate
 * @returns {boolean} true if action is valid
 */
module.exports.isAction = function(action) {

    return Object.keys(internals.actions).some(key => internals.actions[key] === action);
};
