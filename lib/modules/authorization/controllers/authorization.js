/**
 * The authorization controller
 * @module
 */

const Path = require('path');
const AuthorizationService = require(Path.join(process.cwd(), 'lib/modules/authorization/services/authorization'));
const Action = require(Path.join(process.cwd(), 'lib/utils/action'));
const NSError = require(Path.join(process.cwd(), 'lib/errors/nserror'));

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
