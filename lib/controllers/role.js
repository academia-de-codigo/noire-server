'use strict';

var Boom = require('boom');
var RoleService = require('../services/role');

exports.list = function(request, reply) {

    if (!request.params.id) {
        RoleService.list().then(function(data) {

            request.log(['debug', 'role'], data);
            return reply(data);

        }).catch(function(error) {

            return Boom.badImplementation(error);
        });
    } else {

        RoleService.findById(request.params.id).then(function(data) {

            if (!data) {
                return reply(Boom.notFound('role not found'));
            }

            request.log(['debug', 'role'], data);
            return reply(data);

        }).catch(function(error) {
            return Boom.badImplementation(error);
        });

    }

};
