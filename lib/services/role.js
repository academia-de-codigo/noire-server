'use strict';

var HSError = require('../error');
var Repository = require('../plugins/repository');

exports.list = function() {
    return Repository.role.findAll();
};

exports.findById = function(id) {
    return Repository.role.findOne(id).eager('users').omit(['password']).then(function(role) {

        if (!role) {
            throw HSError.RESOURCE_NOT_FOUND;
        }

        return role;
    });
};

exports.findByName = function(name) {
    return Repository.role.query().where('name', name);
};

exports.add = function(entity) {

    // transaction protects against duplicates caused by simultaneous add
    return Repository.tx(Repository.role.model, function(txRoleRepository) {

        return txRoleRepository.query().where('name', entity.name).then(function(roles) {

            if (roles.length !== 0) {
                throw HSError.RESOURCE_DUPLICATE;
            }

            return txRoleRepository.add(entity);
        });
    });
};

exports.delete = function(id) {

    // protect against simultaneous add role to user while deleting role
    return Repository.tx(Repository.role.model, function(txRoleRepository) {

        return txRoleRepository.findOne(id).eager('users').then(function(role) {

            if (!role) {
                throw HSError.RESOURCE_NOT_FOUND;
            }

            if (role.users && role.users.length !== 0) {
                throw HSError.RESOURCE_RELATION;
            }

            return txRoleRepository.remove(id).then(function(count) {

                if (count !== 1) {
                    throw HSError.RESOURCE_DELETE;
                }

                return;
            });
        });
    });
};

exports.update = function(id, entity) {

    // protects against simultaneous update of two roles for the same name
    return Repository.tx(Repository.role.model, function(txRoleRepository) {

        return txRoleRepository.findOne(id).then(function(role) {

            if (!role) {
                throw HSError.RESOURCE_NOT_FOUND;
            }

            return txRoleRepository.query().where('name', entity.name).then(function(equalRoles) {

                if (equalRoles.length > 0) {
                    throw HSError.RESOURCE_DUPLICATE;
                }

                role.name = entity.name;
                return txRoleRepository.update(role);
            });
        });
    });
};

exports.addUser = function(id, userId) {

    return Repository.tx(Repository.role.model, Repository.user.model, function(txRoleRepository, txUserRepository) {

        return txRoleRepository.findOne(id).eager('users').then(function(role) {

            if (!role) {
                throw HSError.RESOURCE_NOT_FOUND;
            }

            return txUserRepository.findOne(userId).then(function(user) {

                if (!user) {
                    throw HSError.RESOURCE_NOT_FOUND;
                }

                var duplicateUser = role.users.every(function(roleUser) {
                    return roleUser.id !== user.id;
                });

                if (!duplicateUser) {
                    throw HSError.RESOURCE_DUPLICATE;
                }

                return role.$relatedQuery('users').relate(userId);

            });
        });
    });
};
