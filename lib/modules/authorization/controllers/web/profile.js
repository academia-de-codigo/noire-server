/**
 * The user profile page controller
 * @module
 */

/**
 * Renders the user profile view
 * @param {Request} request the request object
 * @param {Toolkit} h the response toolkit
 * @returns {Response} the view response
 */
exports.get = function(request, h) {

    request.log(['profile', 'get', 'debug']);

    return h.view('pages/profile');
};
