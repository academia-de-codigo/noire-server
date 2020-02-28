/**
 * API Permission Controller
 * @module
 */

const PermissionService = require('modules/authorization/services/permission');

/**
 * Lists permissions
 * @param {Request} request the request object
 * @param {Toolkit} h the response toolkit
 * @returns {Response} the response object containing the list of roles
 */
exports.list = async function(request, h) {
    const [totalCount, results] = await Promise.all([
        PermissionService.count(request.query),
        PermissionService.list(request.query)
    ]);

    return h.paginate(results, totalCount);
};

/**
 * Gets a permission
 * @param {Request} request the request object
 * @param {Toolkit} h the response toolkit
 * @returns {Response} the response object containing the role
 */
exports.get = function(request) {
    // path params are passed as strings
    const id = Number.parseInt(request.params.id);

    return PermissionService.findById(id);
};

/**
 * Creates a new permission
 * @param {Request} request the request object
 * @param {Toolkit} h the response toolkit
 * @returns {Response} the response object containing the created role
 */
exports.create = async function(request, h) {
    const data = await PermissionService.add(request.payload);

    return h.response(data).created(`/permission/${data.id}`);
};

/**
 * Deletes a permission
 * @param {Request} request the request object
 * @param {Toolkit} h the response toolkit
 * @returns {Response} the response object
 */
exports.delete = async function(request, h) {
    await PermissionService.delete(request.params.id);

    return h.response();
};

/**
 * Update a permission
 * @param {Request} request the request object
 * @param {Toolkit} h the response toolkit
 * @returns {Response} the response object containing the updated user
 */
exports.update = function(request) {
    const [id, payload] = [Number.parseInt(request.params.id), request.payload];

    return PermissionService.update(id, payload);
};
