'use strict';

var Promise = require('bluebird');
var HSError = require('../error');
var Action = require('../action');
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

    return Repository.tx(Repository.role.model, function(txRoleRepository) {

        return txRoleRepository.findOne(id).then(function(role) {

            if (!role) {
                throw HSError.RESOURCE_NOT_FOUND;
            }

            return txRoleRepository.query().where('name', entity.name)
                .then(function(equalRoles) {

                    if (equalRoles.length > 0 && equalRoles[0].id !== Number.parseInt(id)) {
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

exports.addPermission = function(id, action, resource) {

    var actionExists = Object.keys(Action).some(function(key) {
        return Action[key] === action;
    });

    if (!actionExists) {
        return Promise.reject(HSError.RESOURCE_NOT_FOUND);
    }

    return Repository.tx(Repository.role.model, Repository.permission.model, Repository.resource.model,
        function(txRoleRepository, txPermissionRepository, txResourceModel) {

            return txRoleRepository.findOne(id).then(function(role) {

                if (!role) {
                    throw HSError.RESOURCE_NOT_FOUND;
                }

                return txResourceModel.query().where('name', resource).then(function(resources) {

                    if (resources.length === 0) {
                        throw HSError.RESOURCE_NOT_FOUND;
                    }

                    return txPermissionRepository.add({
                        action: action
                    }).then(function(permission) {

                        return permission.$relatedQuery('resources').relate(resources[0].id).then(function(resourceId) {

                            if (resourceId !== resources[0].id) {
                                throw HSError.RESOURCE_RELATION;
                            }

                            return role.$relatedQuery('permissions').relate(permission.id);

                        });
                    });
                });
            });
        });
};
