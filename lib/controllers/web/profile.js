'use strict';

var UserService = require('../../services/user');

exports.get = function(request, reply) {

    UserService.findById(request.auth.credentials.id).then(function(user) {

        var userData = {
            username: user.username,
            name: user.name,
            email: user.email,
            roles: user.roles.map(function(role) {
                return role.name;
            })
        };

        reply.view('pages/profile', {
            user: userData
        });
    });
};
