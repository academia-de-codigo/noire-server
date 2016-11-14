'use strict';

var HSError = require('../error');
var RoleService = require('../services/role');

exports.list = function(request, reply) {

    request.log(['role', 'list', 'debug']);

    RoleService.list().then(function(roles) {

        return reply(roles);

    }).catch(function(error) {

        reply(HSError.toBoom(error));
    });
};

exports.get = function(request, reply) {

    request.log(['role', 'get', 'debug']);

    RoleService.findById(request.params.id).then(function(role) {

        return reply(role);

    }).catch(function(error) {

        reply(HSError.toBoom(error));
    });
};

exports.create = function(request, reply) {

    request.log(['role', 'create', 'debug']);

    RoleService.add(request.payload).then(function(data) {

        return reply(data).created('/role/' + data.id);

    }).catch(function(error) {

        reply(HSError.toBoom(error));
    });
};

exports.delete = function(request, reply) {

    request.log(['role', 'delete', 'debug']);

    RoleService.delete(request.params.id).then(function(data) {

        return reply(data);

    }).catch(function(error) {

        reply(HSError.toBoom(error));
    });
};

exports.update = function(request, reply) {

    request.log(['role', 'update', 'debug']);

    RoleService.update(request.params.id, request.payload).then(function(data) {

        return reply(data);

    }).catch(function(error) {

        reply(HSError.toBoom(error));
    });
};

exports.addUser = function(request, reply) {

    request.log(['role', 'addUser', 'debug']);

    RoleService.addUser(request.params.id, request.payload.id).then(function(data) {

        return reply(data);

    }).catch(function(error) {

        reply(HSError.toBoom(error));
    });
};
