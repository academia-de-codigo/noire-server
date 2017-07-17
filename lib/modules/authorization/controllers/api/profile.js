var HSError = require('../../../../error');
var UserService = require('../../services/user');

exports.get = function(request, reply) {

    request.log(['profile', 'get', 'debug']);

    UserService.findById(request.auth.credentials.id).then(function(user) {

        return reply(user);

    }).catch(function(error) {

        reply(HSError.toBoom(error));
    });
};

exports.update = function(request, reply) {

    request.log(['profile', 'update', 'debug']);

    UserService.update(request.auth.credentials.id, request.payload).then(function(data) {

        return reply(data);

    }).catch(function(error) {

        reply(HSError.toBoom(error));
    });
};
