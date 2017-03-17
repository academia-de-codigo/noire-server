'use strict';

var UserService = require('../../services/user');
var Config = require('../../config');

exports.get = function(request, reply) {

    // maybe this auth step can be done on the route object...
    if (!request.auth.credentials) {
        return reply.redirect(Config.paths.home);
    }

    UserService.findById(request.auth.credentials.id).then(function(u) {
        var user = {
            username: u.username,
            name: u.name,
            email: u.email,
            roles: u.roles
        };

        reply.view('pages/profile', {
            user: user
        });
    });
};
