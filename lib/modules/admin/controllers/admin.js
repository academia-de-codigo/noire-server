/**
 * The admin page controller
 * @module
 */
const UserService = require('modules/authorization/services/user');

/**
 * Renders the admin view
 * @param {Request} request the request object
 * @param {Toolkit} h the response toolkit
 * @returns {Response} the view response
 */
exports.get = async function(request, h) {
    const users = await UserService.list();
    return h.view('pages/admin/admin', {
        users: users
    });
};
