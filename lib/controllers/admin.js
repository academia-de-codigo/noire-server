'use strict';

var Promise = require('bluebird');
var HSError = require('../error');
var UserService = require('../services/user');
var RoleService = require('../services/role');

exports.get = function(request, reply) {

    request.log(['admin', 'get', 'debug']);

    var getUserCount = UserService.count();
    var getRoleCount = RoleService.count();

    Promise.join(getUserCount, getRoleCount, function(userCount, roleCount) {

        return reply.view('admin', {
            user: request.auth.credentials,
            count: {
                users: userCount,
                roles: roleCount
            }
        });

    }).catch(function(error) {

        reply(HSError.toBoom(error));
    });
};
