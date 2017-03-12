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

            return txUserRepository.query().where('username', entity.username).orWhere('email', entity.email)
                .then(function(users) {

                    if (users.length !== 0) {
                        throw HSError.RESOURCE_DUPLICATE;
                    }

                    return txUserRepository.add(entity);
                });
        });
    });
};

exports.update = function(id, entity) {

    return Repository.tx(Repository.user.model, function(txUserRepository) {

        return txUserRepository.findOne(id).then(function(user) {

            if (!user) {
                throw HSError.RESOURCE_NOT_FOUND;
            }

            return txUserRepository.query().skipUndefined()
                .where('username', entity.username).orWhere('email', entity.email)
                .then(function(equalUsers) {

                    if (equalUsers.length > 0 && equalUsers[0].id !== Number.parseInt(id)) {
                        throw HSError.RESOURCE_DUPLICATE;
                    }

                    user.username = entity.username || user.username;
                    user.name = entity.name || user.name;
                    user.email = entity.email || user.email;
                    user.password = entity.password || user.password;

                    // need to explicitely test for active boolean presence
                    if (entity.active !== undefined) {
                        user.active = entity.active;
                    }

                    return txUserRepository.update(user);
                });
        });
    });
};

exports.authenticate = function(username, password) {

    var user = null;
    return Repository.user.query().where('username', username).then(function(users) {

        user = users[0];

        if (!user || !user.active) {
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
