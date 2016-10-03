'use strict';

var Boom = require('boom');
var UserService = require('../services/user');
var Auth = require('../plugins/auth');

exports.login = function(request, reply) {

    var user = UserService.getByEmail(request.payload.email, request.payload.password);

    if (!user) {
        return reply(Boom.unauthorized('Invalid email address'));
    }

    if (user.password !== request.payload.password) {
        return reply(Boom.unauthorized('Bad password'));
    }

    return reply('Login successful').header('Authorization', Auth.getToken(user.id));
};
