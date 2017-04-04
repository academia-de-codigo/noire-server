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

internals.queryParams = {};

internals.createQueryString = function() {
    var result = '?';
    var query = internals.queryParams;

    if (query.limit) {
        result += 'limit=' + query.limit + '&';
    }
    if (query.page) {
        result += 'page=' + query.page + '&';
    }
    if (query.sort) {
        result += 'sort=' + query.sort + '&';
    }
    if (query.descending) {
        result += 'descending=' + query.descending;
    }

    return result;
};

internals.getNextPageHelper = function(page, count) {
    page = page || 1;
    var limit = internals.queryParams.limit || count;

    // if we're in the last page, don't increment it
    if (page >= Math.floor(count / limit)) {
        return;
    }

    return function() {
        // if there's no query value for page, assume we're on page 1
        internals.queryParams.page = parseInt(page || 1) + 1;
        return internals.createQueryString();
    };
};

internals.getPreviousPageHelper = function(page) {
    return function() {
        internals.queryParams.page = parseInt(page) - 1;
        return internals.createQueryString();
    };
};

internals.getFirstPageHelper = function() {
    return function() {
        internals.queryParams.page = 1;
        return internals.createQueryString();
    };
};

internals.getLastPageHelper = function(count) {
    return function() {
        internals.queryParams.page = Math.floor(count / parseInt(internals.queryParams.limit));
        return internals.createQueryString();
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

    var getUserCount = UserService.count();
    var getUsers = UserService.list(request.query);
    internals.queryParams = request.query;

    Promise.join(getUserCount, getUsers, function(userCount, users) {
        return reply.view('pages/admin', {
            getAdminPartial: internals.getPartialHelper(request.params.partial),
            users: users,
            getNextPage: internals.getNextPageHelper(request.query.page, userCount),
            getPreviousPage: internals.getPreviousPageHelper(request.query.page),
            getFirstPage: internals.getFirstPageHelper(),
            getLastPage: internals.getLastPageHelper(userCount)
        });
    }).catch(function(error) {

        reply(HSError.toBoom(error));
    });
};

internals.listRoles = function(request, reply) {

    request.log(['admin', 'listRoles', 'debug']);
    var getRoleCount = RoleService.count();
    var getRoles = RoleService.list(request.query);
    internals.queryParams = request.query;

    Promise.join(getRoleCount, getRoles, function(roleCount, roles) {

        return reply.view('pages/admin', {
            getAdminPartial: internals.getPartialHelper(request.params.partial),
            roles: roles,
            getNextPage: internals.getNextPageHelper(request.query.page, roleCount),
            getPreviousPage: internals.getPreviousPageHelper(request.query.page),
            getFirstPage: internals.getFirstPageHelper(),
            getLastPage: internals.getLastPageHelper(roleCount)
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
