/**
 * API Profile Controller
 */

const UserService = require('modules/authorization/services/user');

/**
 * Gets the user profile
 * @async
 * @param {Request} request the request object
 * @returns {Response} the response object containing the list of users
 */
exports.get = function(request) {
    return UserService.findById(request.auth.credentials.id);
};

/**
 * Update the user profile
 * @async
 * @param {Request} request the request object
 * @returns {Response} the response object containing the updated user
 */
exports.update = async function(request) {
    const [id, payload] = [request.auth.credentials.id, request.payload];
    const data = await UserService.update(id, payload);

    // make sure the password is not sent in the response
    delete data.password;

    return data;
};
