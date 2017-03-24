var internals = {};

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
