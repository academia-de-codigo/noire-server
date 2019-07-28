/**
 * API Resource Controller
 * @module
 */

const ResourceService = require('modules/authorization/services/resource');

/**
 * Lists resources
 * @returns {Response} the response object containing the list of resources
 */
exports.list = function() {
    return ResourceService.list();
};

/**
 * Gets resource by name
 * @param {Request} request the request object
 * @returns {Response} the response object containing the list of resources
 */
exports.getByName = function(request) {
    return ResourceService.findByName(request.params.name);
};
