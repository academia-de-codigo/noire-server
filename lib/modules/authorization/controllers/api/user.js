/**
 * API User Controller
 * @module
 */

const Path = require('path');
const UserService = require(Path.join(process.cwd(), 'lib/modules/authorization/services/user'));

/**
 * Lists users
 * @async
 * @param {Request} request the request object
 * @returns {Response} the list of users
 */
exports.list = async function(request) {

    request.log(['user', 'list', 'debug']);

    return await UserService.list(request.query);
};

/**
 * Gets a user
 * @async
 * @param {Request} request the request object
 * @returns {Response} the users
 */
exports.get = async function(request) {

    request.log(['user', 'get', 'debug']);

    // path params are passed as strings
    const id = Number.parseInt(request.params.id);

    return await UserService.findById(id);
};

/**
 * Create a new user
 * @async
 * @param {Request} request the request object
 * @param {Toolkit} h the response toolkit
 * @returns {Response} the created user
 */
exports.create = async function(request, h) {

    request.log(['user', 'create', 'debug']);

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

    request.log(['user', 'delete', 'debug']);

    await UserService.delete(request.params.id);

    return h.response();
};

/**
 * Update a user
 * @async
 * @param {Request} request the request object
 * @returns {Response} the updated user
 */
exports.update = async function(request) {

    request.log(['user', 'update', 'debug']);

    // path params are passed as strings
    const [id, payload] = [Number.parseInt(request.params.id), request.payload];

    const data = await UserService.update(id, payload);

    // make sure the password is not sent in the response
    delete data.password;

    return data;
};
