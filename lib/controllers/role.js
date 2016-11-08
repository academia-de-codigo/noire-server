'use strict';

var Boom = require('boom');
var RoleService = require('../services/role');

exports.list = function(request, reply) {

    RoleService.list().then(function(data) {
        return reply(data);
    }).catch(function(error) {
        return Boom.badImplementation(error);
    });
};
