'use strict';

var HSError = require('../error');
var UserService = require('../services/user');

exports.list = function(request, reply) {

    request.log(['user', 'list', 'debug']);

    UserService.list().then(function(users) {

        return reply(users);

    }).catch(function(error) {

        reply(HSError.toBoom(error));
    });
};

exports.get = function(request, reply) {

    request.log(['user', 'get', 'debug']);

    UserService.findById(request.params.id).then(function(user) {

        if (!user) {
            throw HSError.RESOURCE_NOT_FOUND;
        }

        return reply(user);

    }).catch(function(error) {

        reply(HSError.toBoom(error));
    });
};
