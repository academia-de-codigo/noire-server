'use strict';

var Boom = require('boom');
var Error = require('../error');
var RoleService = require('../services/role');

exports.list = function(request, reply) {

    RoleService.list().then(function(roles) {

        return reply(roles);

    }).catch(function(error) {

        reply(Error.toBoom(error));
    });
};

exports.get = function(request, reply) {

    RoleService.findById(request.params.id).then(function(role) {

        if (!role) {
            throw Boom.notFound(Error.RESOURCE_NOT_FOUND);
        }

        return reply(role);

    }).catch(function(error) {

        reply(Error.toBoom(error));
    });
};

exports.create = function(request, reply) {

    RoleService.add(request.payload).then(function(data) {

        return reply(data).created('/role/' + data.id);

    }).catch(function(error) {

        reply(Error.toBoom(error));
    });
};

exports.delete = function(request, reply) {

    RoleService.delete(request.params.id).then(function(data) {

        return reply(data);

    }).catch(function(error) {

        reply(Error.toBoom(error));
    });
};

exports.update = function(request, reply) {

    RoleService.update(request.params.id, request.payload).then(function(data) {

        return reply(data);

    }).catch(function(error) {

        reply(Error.toBoom(error));
    });
};
