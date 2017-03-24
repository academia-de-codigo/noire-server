var AuthorizationService = require('../services/authorization');
var Action = require('../action');
var HSError = require('../error');

exports.authorize = function(resource, action) {

    return function(request, reply) {

        var username = request.auth.credentials.username;

        // infer action from http method if one is not provided
        action = action || Action.getByHttpMethod(request.method);

        return AuthorizationService.canUser(username, action, resource).then(function(authorized) {

            if (!authorized) {
                throw HSError.AUTH_UNAUTHORIZED;
            }

            request.log(['authorized', action, resource, 'debug'], username);
            reply();

        }).catch(function(error) {

            request.log(['forbidden', action, resource, 'debug'], username);
            reply(HSError.toBoom(error));
        });
    };
};
