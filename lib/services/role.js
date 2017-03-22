'use strict';

var Promise = require('bluebird');
var HSError = require('../error');
var Action = require('../action');
var Repository = require('../plugins/repository');

exports.count = function() {
    return Repository.role.query().count('* as count').then(function(result) {
        return result[0].count;
    });
};

exports.list = function() {
    return Repository.role.findAll();
};

exports.findById = function(id) {
    return Repository.role.findOne(id).eager('users').omit(['password']).mergeEager('permissions').then(function(role) {

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

            return txRoleRepository.remove(id);

        }).then(function(count) {

            if (count !== 1) {
                throw HSError.RESOURCE_DELETE;
            }

            return;
        });
    });
};

exports.update = function(id, entity) {

    return Repository.tx(Repository.role.model, function(txRoleRepository) {

        var getRoleById = txRoleRepository.findOne(id);
        var getRolesByName = txRoleRepository.query().where('name', entity.name);

        return Promise.join(getRoleById, getRolesByName, function(role, equalRoles) {

            if (!role) {
                throw HSError.RESOURCE_NOT_FOUND;
            }

            if (equalRoles.length > 0 && equalRoles[0].id !== Number.parseInt(id)) {
                throw HSError.RESOURCE_DUPLICATE;
            }

            role.name = entity.name;
            return txRoleRepository.update(role);
        });
    });
};

exports.addUsers = function(id, userIds) {

    if (!Array.isArray(userIds)) {
        var userId = userIds;
        userIds = [userId];
    }

    return Repository.tx(Repository.role.model, Repository.user.model, function(txRoleRepository, txUserRepository) {

        var getRoleById = txRoleRepository.findOne(id).eager('users');
        var getUsersById = [];
        userIds.forEach(function(userId) {
            getUsersById.push(txUserRepository.findOne(userId));
        });

        return Promise.join(getRoleById, Promise.all(getUsersById), function(role, users) {

            var notUser, duplicateUser, relatedQueries;

            if (!role) {
                throw HSError.RESOURCE_NOT_FOUND;
            }

            // if at least one of the users doesn't exist throw error
            notUser = users.some(function(user) {
                return !user;
            });

            if (notUser) {
                throw HSError.RESOURCE_NOT_FOUND;
            }

            duplicateUser = role.users.some(function(roleUser) {
                return userIds.includes(roleUser.id);
            });

            if (duplicateUser) {
                throw HSError.RESOURCE_DUPLICATE;
            }

            relatedQueries = [];
            userIds.forEach(function(userId) {

                relatedQueries.push(role.$relatedQuery('users').relate(userId));

            });

            return Promise.all(relatedQueries);
        });
    });
};

exports.removeUsers = function(id, userIds) {

    if (!Array.isArray(userIds)) {
        var userId = userIds;
        userIds = [userId];
    }

    return Repository.tx(Repository.role.model, Repository.user.model, function(txRoleRepository, txUserRepository) {

        var getRoleById = txRoleRepository.findOne(id).eager('users');
        var getUsersById = [];
        userIds.forEach(function(userId) {
            getUsersById.push(txUserRepository.findOne(userId));
        });

        return Promise.join(getRoleById, Promise.all(getUsersById), function(role, users) {

            var notUser, noUser, relatedQueries;

            if (!role) {
                throw HSError.RESOURCE_NOT_FOUND;
            }

            notUser = users.some(function(user) {
                return !user;
            });

            if (notUser) {
                throw HSError.RESOURCE_NOT_FOUND;
            }

            //check if role has this user
            noUser = role.users.every(function(roleUser) {
                return !userIds.includes(roleUser.id);
            });

            if (noUser) {
                throw HSError.RESOURCE_NOT_FOUND;
            }

            relatedQueries = [];

            userIds.forEach(function(userId) {

                relatedQueries.push(role.$relatedQuery('users').unrelate().where('id', userId));

            });

            return Promise.all(relatedQueries);
        });
    });
};

exports.addPermission = function(id, action, resourceName) {

    var actionExists = Object.keys(Action).some(function(key) {
        return Action[key] === action;
    });

    if (!actionExists) {
        return Promise.reject(HSError.RESOURCE_NOT_FOUND);
    }

    return Repository.tx(Repository.role.model, Repository.permission.model, Repository.resource.model,
        function(txRoleRepository, txPermissionRepository, txResourceRepository) {

            var getRoleById = txRoleRepository.findOne(id).eager('permissions');
            var getResourcesByName = txResourceRepository.query().where('name', resourceName);

            return Promise.join(getRoleById, getResourcesByName, function(role, resources) {

                if (!role) {
                    throw HSError.RESOURCE_NOT_FOUND;
                }

                if (resources.length !== 1) {
                    throw HSError.RESOURCE_NOT_FOUND;
                }

                var resource = resources[0];

                return txPermissionRepository.query().where('action', action).andWhere('resource_id', resource.id)
                    .then(function(permissions) {

                        // permission does not exist and we need to create a new one
                        if (permissions.length === 0) {

                            return txPermissionRepository.add({
                                action: action,
                                resource_id: resource.id
                            });

                        } else {

                            // permission already exists and we can re-use it
                            return Promise.resolve(permissions[0]);
                        }

                    }).then(function(permission) {

                        var permissionExists = role.permissions.some(function(perm) {
                            return perm.id === permission.id;
                        });

                        if (permissionExists) {
                            throw HSError.RESOURCE_DUPLICATE;
                        }

                        return role.$relatedQuery('permissions').relate(permission.id);
                    });
            });
        });
};

// This will remove permission from role, but will not delete the permission from the permissions table
exports.removePermissions = function(id, permissionIds) {

    if (!Array.isArray(permissionIds)) {
        var permissionId = permissionIds;
        permissionIds = [permissionId];
    }

    return Repository.tx(Repository.role.model, Repository.permission.model, function(txRoleRepository, txPermissionRepository) {

        var getRoleById = txRoleRepository.findOne(id).eager('permissions');
        var getPermissionsById = [];
        permissionIds.forEach(function(permissionId) {
            getPermissionsById.push(txPermissionRepository.findOne(permissionId));
        });

        return Promise.join(getRoleById, Promise.all(getPermissionsById), function(role, permissions) {

            var notPermission, noPermission, relatedQueries;

            if (!role) {
                throw HSError.RESOURCE_NOT_FOUND;
            }

            notPermission = permissions.some(function(permission) {
                return !permission;
            });

            if (notPermission) {
                throw HSError.RESOURCE_NOT_FOUND;
            }

            //check if the role has this permission
            noPermission = role.permissions.every(function(rolePermission) {

                return !permissionIds.includes(rolePermission.id);

            });

            if (noPermission) {
                throw HSError.RESOURCE_NOT_FOUND;
            }

            relatedQueries = [];

            permissionIds.forEach(function(permissionId) {
                relatedQueries.push(role.$relatedQuery('permissions').unrelate().where('id', permissionId));
            });

            return Promise.all(relatedQueries);
        });
    });
};
