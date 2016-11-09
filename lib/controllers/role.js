'use strict';

var Boom = require('boom');
var Error = require('../error');
var RoleService = require('../services/role');

exports.list = function(request, reply) {

    RoleService.list().then(function(roles) {

        request.log(['debug', 'role'], roles);
        return reply(roles);

    }).catch(function(error) {

        return Boom.badImplementation(error);
    });
};

exports.get = function(request, reply) {

    RoleService.findById(request.params.id).then(function(role) {

        if (!role) {
            return reply(Boom.notFound(Error.ROLE_NOT_FOUND));
        }

        request.log(['debug', 'role'], role);
        return reply(role);

    }).catch(function(error) {
        return Boom.badImplementation(error);
    });
};

exports.create = function(request, reply) {

    RoleService.add(request.payload).then(function(data) {

        request.log(['debug', 'role'], data);
        return reply(data);

    }).catch(function(error) {

        if (error === Error.ROLE_EXISTS) {

            request.log(['error', 'role'], error);
            return reply(Boom.badRequest(error, request.payload));
        }

        return Boom.badImplementation(error);

    });
};
