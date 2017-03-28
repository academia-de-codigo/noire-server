var Promise = require('bluebird');
var HSError = require('../../error');
var UserService = require('../../services/user');
var RoleService = require('../../services/role');
var ResourceService = require('../../services/resource');

var internals = {};

internals.getPartialHelper = function(param) {

    var partials = {
        main: 'admin/main',
        user: 'admin/user',
        users: 'admin/user-list',
        role: 'admin/role',
        roles: 'admin/role-list'
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

internals.listUsers = function(request, reply) {

    request.log(['admin', 'listUsers', 'debug']);

    UserService.list().then(function(users) {

        return reply.view('pages/admin', {
            getAdminPartial: internals.getPartialHelper(request.params.partial),
            users: users
        });
    }).catch(function(error) {

        reply(HSError.toBoom(error));
    });
};

internals.listRoles = function(request, reply) {

    request.log(['admin', 'listRoles', 'debug']);

    RoleService.list().then(function(roles) {

        return reply.view('pages/admin', {
            getAdminPartial: internals.getPartialHelper(request.params.partial),
            roles: roles
        });
    }).catch(function(error) {

        reply(HSError.toBoom(error));
    });
};

internals.handlers = {
    main: internals.getMain,
    users: internals.listUsers,
    roles: internals.listRoles
};

exports.get = function(request, reply) {

    var handler = internals.handlers[request.params.partial] || internals.handlers.main;
    return handler(request, reply);
};

exports.getUser = function(request, reply) {

    request.log(['admin', 'getUser', 'debug']);

    UserService.findById(request.params.id).then(function(user) {

        return reply.view('pages/admin', {
            getAdminPartial: internals.getPartialHelper('user'),
            user: user
        });
    }).catch(function(error) {

        reply(HSError.toBoom(error));
    });
};

exports.getRole = function(request, reply) {

    request.log(['admin', 'getRole', 'debug']);

    RoleService.findById(request.params.id).then(function(role) {

        return reply.view('pages/admin', {
            getAdminPartial: internals.getPartialHelper('role'),
            role: role
        });
    }).catch(function(error) {

        reply(HSError.toBoom(error));
    });
};
