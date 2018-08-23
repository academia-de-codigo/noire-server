/**
 * Resource Actions
 * @module
 */

const Actions = require('enums/actions');

const internals = {};

/**
 * Hash mapping http methods to actions
 * @type {Object}
 */
internals.methods = {
    get: Actions.READ,
    post: Actions.CREATE,
    put: Actions.UPDATE,
    delete: Actions.DELETE
};

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
    return Object.keys(Actions).some(key => Actions[key] === action);
};
