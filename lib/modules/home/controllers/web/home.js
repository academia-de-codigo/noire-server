/**
 * The home page controller
 * @module
 */

/**
 * Renders the home view
 * @param {Request} request the request object
 * @param {Toolkit} h the response toolkit
 * @returns {Response} the view response
 */
exports.get = function(request, h) {

    return h.view('pages/home');
};
