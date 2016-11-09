'use strict';

var Boom = require('boom');
var Error = require('../error');
var RoleService = require('../services/role');

exports.list = function(request, reply) {

    RoleService.list().then(function(roles) {

        return reply(roles);

    }).catch(function(error) {

        if (error.isBoom) {
            reply(error);
            return;
        }

        request.log(['error'], error);
        reply(Boom.badImplementation(error));

    });
};

exports.get = function(request, reply) {

    RoleService.findById(request.params.id).then(function(role) {

        if (!role) {
            throw Boom.notFound(Error.ROLE_NOT_FOUND);
        }

        return reply(role);

    }).catch(function(error) {

        if (error.isBoom) {
            reply(error);
            return;
        }

        request.log(['error'], error);
        reply(Boom.badImplementation(error));
    });
};

exports.create = function(request, reply) {

    RoleService.add(request.payload).then(function(data) {

        return reply(data);

    }).catch(function(error) {

        if (error.isBoom) {
            reply(error);
            return;
        }

        if (error === Error.ROLE_EXISTS) {
            return reply(Boom.badRequest(error, request.payload));
        }

        request.log(['error'], error);
        reply(Boom.badImplementation(error));

    });

};
