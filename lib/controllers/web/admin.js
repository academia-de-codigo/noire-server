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

// generate name, value and selected attributes dinamically for the option tag
internals.getSortAttributes = function(sortOptions, queryParams) {

    var initialState = queryParams.sort;

    sortOptions.forEach(function(option) {
        //don't build a query for the default
        if (option.name === 'Sort') {
            return;
        }

        queryParams.sort = option.name.toLowerCase();
        option.value = internals.buildQuery(queryParams);
        option.selected = initialState === option.name.toLowerCase();

    });

    queryParams.sort = initialState;
    return sortOptions;
};

// generate attributes dinamically for the option tag
internals.getLimitAttributes = function(queryParams) {

    var initialState = queryParams.limit;
    var limitOptions = [
        {
            value: '',
            name: 'Limit'
        },
        {
            name: '1',
        },
        {
            name: '50',
        },
        {
            name: '100',
        }
    ];

    limitOptions.forEach(function(option) {
        //don't build a query for the default
        if (option.name === 'Limit') {
            return;
        }

        queryParams.limit = option.name;
        option.value = internals.buildQuery(queryParams);
        option.selected = initialState === option.name;

    });

    queryParams.limit = initialState;
    return limitOptions;
};

internals.getNextPageHelper = function(query, count) {

    var page = query.page || 1;
    var limit = query.limit || count;

    return function() {
        // if there's no query value for page, assume we're on page 1
        // also, don't increment if we're on laste page

        if (page < (count / limit)) {
            query.page = parseInt(page || 1) + 1;
        } else {
            query.page = Math.ceil(count / limit);
        }
        return internals.buildQuery(query);
    };
};

internals.getPreviousPageHelper = function(query) {
    var page = query.page || 1;
    return function() {
        if (page > 1) {
            query.page = parseInt(page) - 1;
        }
        return internals.buildQuery(query);
    };
};

internals.getFirstPageHelper = function(query) {
    return function() {
        query.page = 1;
        return internals.buildQuery(query);
    };
};

internals.getLastPageHelper = function(query, count) {
    var limit = query.limit || count;
    return function() {
        query.page = Math.ceil(count / parseInt(limit));
        return internals.buildQuery(query);
    };
};

internals.buildQuery = function(query) {

    var queryString = '';
    for (var key in query) {
        var value = query[key];

        if (!value) {
            continue;
        }
        queryString += key + '=' + value + '&';
    }
    if (queryString.length > 0) {
        queryString = '?' + queryString.substring(0, queryString.length - 1); //add the '?' and chop off last '&'
    }
    return queryString;
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
    var userSortOptions = [
        {
            value: '',
            name: 'Sort',
        },
        {
            name: 'Username',
        },
        {
            name: 'Name',
        },
        {
            name: 'Email',
        }
    ];

    Promise.join(getUserCount, getUsers, function(userCount, users) {
        return reply.view('pages/admin', {
            getAdminPartial: internals.getPartialHelper(request.params.partial),
            users: users,
            sortOptions: internals.getSortAttributes(userSortOptions, request.query),
            limitOptions: internals.getLimitAttributes(request.query),
            getNextPage: internals.getNextPageHelper(request.query, userCount),
            getPreviousPage: internals.getPreviousPageHelper(request.query),
            getFirstPage: internals.getFirstPageHelper(request.query),
            getLastPage: internals.getLastPageHelper(request.query, userCount),
        });
    }).catch(function(error) {

        reply(HSError.toBoom(error));
    });
};

internals.listRoles = function(request, reply) {

    request.log(['admin', 'listRoles', 'debug']);
    var getRoleCount = RoleService.count();
    var getRoles = RoleService.list(request.query);

    var roleSortOptions = [
        {
            value: '',
            name: 'Sort',
        },
        {
            name: 'Name',
        },
        {
            name: 'Description',
        }
    ];

    Promise.join(getRoleCount, getRoles, function(roleCount, roles) {

        return reply.view('pages/admin', {
            getAdminPartial: internals.getPartialHelper(request.params.partial),
            roles: roles,
            sortOptions: internals.getSortAttributes(roleSortOptions, request.query),
            limitOptions: internals.getLimitAttributes(request.query),
            getNextPage: internals.getNextPageHelper(request.query, roleCount),
            getPreviousPage: internals.getPreviousPageHelper(request.query),
            getFirstPage: internals.getFirstPageHelper(request.query),
            getLastPage: internals.getLastPageHelper(request.query, roleCount)
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
