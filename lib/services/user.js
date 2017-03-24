var Promise = require('bluebird');
var HSError = require('../error');
var Repository = require('../plugins/repository');
var Auth = require('../plugins/auth');

exports.count = function() {
    return Repository.user.query().count('* as count').then(function(result) {
        return result[0].count;
    });
};

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

    // transaction protects against duplicates caused by simultaneous add
    return Repository.tx(Repository.user.model, function(txUserRepository) {

        var getHash = Auth.crypt(entity.password);
        var getDuplicateUsers = txUserRepository.query().where('username', entity.username).orWhere('email', entity.email);

        return Promise.join(getDuplicateUsers, getHash, function(users, hash) {

            if (users.length !== 0) {
                throw HSError.RESOURCE_DUPLICATE;
            }

            entity.password = hash;
            entity.active = false;
            return txUserRepository.add(entity);
        });
    });
};

exports.update = function(id, entity) {

    return Repository.tx(Repository.user.model, function(txUserRepository) {

        var getUserByID = txUserRepository.findOne(id);
        var getDuplicateUsers = txUserRepository.query().skipUndefined()
            .where('username', entity.username).orWhere('email', entity.email);

        return Promise.join(getUserByID, getDuplicateUsers, function(user, duplicateUsers) {

            if (!user) {
                throw HSError.RESOURCE_NOT_FOUND;
            }

            if (duplicateUsers.length > 0 && duplicateUsers[0].id !== Number.parseInt(id)) {
                throw HSError.RESOURCE_DUPLICATE;
            }

            user.username = entity.username || user.username;
            user.name = entity.name || user.name;
            user.email = entity.email || user.email;

            // need to explicitely test for active boolean presence
            if (entity.active !== undefined) {
                user.active = entity.active;
            }

            if (entity.password) {
                return Auth.crypt(entity.password).then(function(password) {

                    user.password = password;
                    return user;
                });
            }

            return user;

        }).then(function(user) {

            return txUserRepository.update(user);
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

        return Auth.getToken(user.id);
    });
};

exports.delete = function(id) {

    return Repository.tx(Repository.user.model, function(txUserRepository) {

        return txUserRepository.findOne(id).then(function(user) {

            if (!user) {
                throw HSError.RESOURCE_NOT_FOUND;
            }
            if (user.active) {
                throw HSError.RESOURCE_STATE;
            }
            return txUserRepository.remove(id);

        }).then(function(count) {

            if (count !== 1) {
                throw HSError.RESOURCE_DELETE;
            }

            return;
        });
    });

};
