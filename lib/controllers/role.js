'use strict';

var Boom = require('boom');
var RoleService = require('../services/role');

exports.findAll = function(request, reply) {

    RoleService.getRoles().then(function(data) {
        return reply(data);
    }).catch(function(error) {
        return Boom.badImplementation(error);
    });

};
