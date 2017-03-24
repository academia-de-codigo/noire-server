var Promise = require('bluebird');
var HSError = require('../../error');
var UserService = require('../../services/user');
var RoleService = require('../../services/role');
var ResourceService = require('../../services/resource');

var internals = {};

internals.getPartialHelper = function(param) {

    var partials = {
        main: 'admin-main',
        users: 'admin-users',
        roles: 'admin-roles'
    };

    return function() {
        return partials[param] || partials.main;
    };
};

internals.getMain = function(request, reply) {

    request.log(['admin', 'get', 'debug']);

    var getUserCount = UserService.count();
    var getRoleCount = RoleService.count();
    var getResourceCount = ResourceService.count();

    Promise.join(getUserCount, getRoleCount, getResourceCount, function(userCount, roleCount, resourceCount) {

        return reply.view('pages/admin', {
            getAdminPartial: internals.getPartialHelper(request.params.partial),
            user: request.auth.credentials,
            count: {
                users: userCount,
                roles: roleCount,
                resources: resourceCount
            }
        });

    }).catch(function(error) {

        reply(HSError.toBoom(error));
    });
};

internals.getUsers = function(request, reply) {

    request.log(['admin', 'getUsers', 'debug']);

    UserService.list().then(function(users) {

        return reply.view('pages/admin', {
            getAdminPartial: internals.getPartialHelper(request.params.partial),
            user: request.auth.credentials,
            users: users
        });
    }).catch(function(error) {

        reply(HSError.toBoom(error));
    });
};

internals.getRoles = function(request, reply) {

    request.log(['admin', 'getRoles', 'debug']);

    RoleService.list().then(function(roles) {

        return reply.view('pages/admin', {
            getAdminPartial: internals.getPartialHelper(request.params.partial),
            user: request.auth.credentials,
            roles: roles
        });
    }).catch(function(error) {

        reply(HSError.toBoom(error));
    });
};

internals.handlers = {
    main: internals.getMain,
    users: internals.getUsers,
    roles: internals.getRoles
};

exports.get = function(request, reply) {

    var handler = internals.handlers[request.params.partial] || internals.handlers.main;
    return handler(request, reply);
};
