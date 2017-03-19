'use strict';

var HSError = require('../../error');
var RoleService = require('../../services/role');

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

    RoleService.delete(request.params.id).then(function() {

        return reply();

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

exports.removeUser = function(request, reply) {

    request.log(['role', 'removeUser', 'debug']);

    RoleService.removeUser(request.params.id, request.payload.id).then(function() {

        return reply().code(204);

    }).catch(function(error) {

        reply(HSError.toBoom(error));
    });
};

exports.addPermission = function(request, reply) {

    request.log(['role', 'addPermission', 'debug']);

    RoleService.addPermission(request.params.id, request.payload.action, request.payload.resource).then(function(data) {

        return reply(data);

    }).catch(function(error) {

        reply(HSError.toBoom(error));
    });
};

exports.removePermission = function(request, reply) {

    request.log(['role', 'removePermission', 'debug']);

    RoleService.removePermission(request.params.id, request.payload.id).then(function() {

        return reply().code(204);

    }).catch(function(error) {

        reply(HSError.toBoom(error));
    });
};
