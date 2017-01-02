'use strict';

var HSError = require('../error');
var Repository = require('../plugins/repository');
var Auth = require('../plugins/auth');

exports.list = function() {
    return Repository.user.findAll().omit(['password']);
};

exports.findById = function(id) {
    return Repository.user.findOne(id).omit(['password']).eager('roles').then(function(user) {

        if (!user) {
            throw HSError.RESOURCE_NOT_FOUND;
        }

        return user;

    });
};

exports.findByUserName = function(username) {
    return Repository.user.query().where('username', username).omit(['password']);
};

exports.findByName = function(name) {
    return Repository.user.query().where('name', name).omit(['password']);
};

exports.findByEmail = function(email) {
    return Repository.user.query().where('email', email).omit(['password']);
};

exports.add = function(entity) {

    return Auth.crypt(entity.password).then(function(hash) {

        entity.password = hash;

        // transaction protects against duplicates caused by simultaneous add
        return Repository.tx(Repository.user.model, function(txUserRepository) {

            return txUserRepository.query().where('username', entity.username).then(function(users) {

                if (users.length !== 0) {
                    throw HSError.RESOURCE_DUPLICATE;
                }

                return txUserRepository.add(entity);
            });
        });
    });
};

exports.authenticate = function(username, password) {

    var user = null;
    return Repository.user.query().where('username', username).then(function(users) {

        user = users[0];

        if (!user) {
            throw HSError.AUTH_INVALID_USERNAME;
        }

        return Auth.compare(password, user.password);

    }).then(function(result) {

        if (!result) {
            throw HSError.AUTH_INVALID_PASSWORD;
        }

        var token = Auth.getToken(user.id);
        return token;
    });
};
