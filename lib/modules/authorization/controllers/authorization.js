/**
 * The authorization controller
 * @module
 */

const AuthorizationService = require('modules/authorization/services/authorization');
const Action = require('utils/action');
const NSError = require('errors/nserror');

/**
 * Authorizes user to perform action on resource
 * Action is impled from http method if not provided
 * @param {string} resource resource to authorize
 * @param {string} [action] optional action to authorize
 * @returns {function} the route pre handler
 */
exports.authorize = function(resource, action) {
    return async function(request, h) {
        const username = request.auth.credentials.username;

        // infer action from http method if one is not provided
        action = action || Action.getByHttpMethod(request.method);

        const authorized = await AuthorizationService.canUser(username, action, resource);

        if (!authorized) {
            request.logger.debug({ action, resource, username }, 'authorization forbidden');
            throw NSError.AUTH_UNAUTHORIZED();
        }

        request.logger.debug({ action, resource, username }, 'authorization succeeded');
        return h.continue;
    };
};
