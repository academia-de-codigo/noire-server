var HSError = require('../../error');
var UserService = require('../../services/user');

exports.list = function(request, reply) {

    request.log(['user', 'list', 'debug']);

    UserService.list(request.query).then(function(users) {

        return reply(users);

    }).catch(function(error) {

        reply(HSError.toBoom(error));
    });
};

exports.get = function(request, reply) {

    request.log(['user', 'get', 'debug']);

    UserService.findById(request.params.id).then(function(user) {

        return reply(user);

    }).catch(function(error) {

        reply(HSError.toBoom(error));
    });
};

exports.create = function(request, reply) {

    request.log(['user', 'create', 'debug']);

    UserService.add(request.payload).then(function(data) {

        // make sure the password is not sent in the response
        delete data.password;

        return reply(data).created('/user/' + data.id);

    }).catch(function(error) {

        reply(HSError.toBoom(error));
    });
};

exports.delete = function(request, reply) {

    request.log(['user', 'delete', 'debug']);

    UserService.delete(request.params.id).then(function(data) {

        return reply(data);

    }).catch(function(error) {

        reply(HSError.toBoom(error));
    });

};

exports.update = function(request, reply) {

    request.log(['user', 'update', 'debug']);

    UserService.update(request.params.id, request.payload).then(function(data) {

        return reply(data);

    }).catch(function(error) {

        reply(HSError.toBoom(error));
    });
};
