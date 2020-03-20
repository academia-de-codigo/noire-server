/**
 * API User Controller
 * @module
 */

const UserService = require('modules/authorization/services/user');

/**
 * Lists users
 * @async
 * @param {Request} request the request object
 * @param {Toolkit} h the response toolkit
 * @returns {Response} the response object containing the list of users
 */
exports.list = async function(request, h) {
    const [count, users] = await Promise.all([
        UserService.count(request.query),
        UserService.list(request.query)
    ]);

    return h.paginate(users, count);
};

/**
 * Gets a user
 * @async
 * @param {Request} request the request object
 * @returns {Response} the response object containing the user
 */
exports.get = function(request) {
    // path params are passed as strings
    const id = Number.parseInt(request.params.id);

    return UserService.findById(id);
};

/**
 * Create a new user
 * @async
 * @param {Request} request the request object
 * @param {Toolkit} h the response toolkit
 * @returns {Response} the response object containing the created user
 */
exports.create = async function(request, h) {
    const data = await UserService.add(request.payload);

    // make sure the password is not sent in the response
    delete data.password;

    return h.response(data).created('/user/' + data.id);
};

/**
 * Delete a user
 * @async
 * @param {Request} request the request object
 * @param {Toolkit} h the response toolkit
 * @returns {Response} the response object
 */
exports.delete = async function(request, h) {
    await UserService.delete(request.params.id);

    return h.response();
};

/**
 * Update a user
 * @async
 * @param {Request} request the request object
 * @returns {Response} the response object containing the updated user
 */
exports.update = async function(request) {
    // path params are passed as strings
    const [id, payload] = [Number.parseInt(request.params.id), request.payload];

    const data = await UserService.update(id, payload);

    // make sure the password is not sent in the response
    delete data.password;

    return data;
};
