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
