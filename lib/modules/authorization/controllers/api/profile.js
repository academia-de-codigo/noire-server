/**
 * API Profile Controller
 */

const Path = require('path');
const UserService = require(Path.join(process.cwd(), 'lib/modules/authorization/services/user'));

/**
 * Gets the user profile
 * @async
 * @param {Request} request the request object
 * @returns {Response} the response object containing the list of users
 */
exports.get = async function(request) {

    request.log(['profile', 'get', 'debug']);

    return await UserService.findById(request.auth.credentials.id);
};

/**
 * Update the user profile
 * @async
 * @param {Request} request the request object
 * @returns {Response} the response object containing the updated user
 */
exports.update = async function(request) {

    request.log(['profile', 'update', 'debug']);

    const [id, payload] = [request.auth.credentials.id, request.payload];
    const data = await UserService.update(id, payload);

    // make sure the password is not sent in the response
    delete data.password;

    return data;
};
