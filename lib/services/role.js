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

    userIds = Array.isArray(userIds) ? userIds : [userIds];

    return Repository.tx(Repository.role.model, Repository.user.model, function(txRoleRepository, txUserRepository) {

        var getRoleById = txRoleRepository.findOne(id).eager('users');
        var getUsersById = userIds.map(function(userId) {
            return txUserRepository.findOne(userId);
        });

        return Promise.join(getRoleById, Promise.all(getUsersById), function(role, users) {

            var userDoesNotExist, userIsDuplicate;

            if (!role) {
                throw HSError.RESOURCE_NOT_FOUND;
            }

            userDoesNotExist = users.some(function(user) {
                return !user;
            });

            // if at least one of the users doesn't exist throw error
            if (userDoesNotExist) {
                throw HSError.RESOURCE_NOT_FOUND;
            }

            userIsDuplicate = role.users.some(function(roleUser) {
                return userIds.indexOf(roleUser.id) !== -1;
            });

            if (userIsDuplicate) {
                throw HSError.RESOURCE_DUPLICATE;
            }

            return Promise.all(userIds.map(function(userId) {
                return role.$relatedQuery('users').relate(userId);
            }));
        });
    });
};

exports.removeUsers = function(id, userIds) {

    userIds = Array.isArray(userIds) ? userIds : [userIds];

    return Repository.tx(Repository.role.model, Repository.user.model, function(txRoleRepository, txUserRepository) {

        var getRoleById = txRoleRepository.findOne(id).eager('users');
        var getUsersById = userIds.map(function(userId) {
            return txUserRepository.findOne(userId);
        });

        return Promise.join(getRoleById, Promise.all(getUsersById), function(role, users) {

            var userDoesNotExist, userNotInRole;

            if (!role) {
                throw HSError.RESOURCE_NOT_FOUND;
            }

            userDoesNotExist = users.some(function(user) {
                return !user;
            });

            if (userDoesNotExist) {
                throw HSError.RESOURCE_NOT_FOUND;
            }

            //check if role has this user
            userNotInRole = userIds.some(function(userId) {

                var roleUserIds = role.users.map(function(roleUser) {
                    return roleUser.id;
                });

                return roleUserIds.indexOf(userId) === -1;
            });

            if (userNotInRole) {
                throw HSError.RESOURCE_NOT_FOUND;
            }

            return Promise.all(userIds.map(function(userId) {
                return role.$relatedQuery('users').unrelate().where('id', userId);
            }));
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

    permissionIds = Array.isArray(permissionIds) ? permissionIds : [permissionIds];

    return Repository.tx(Repository.role.model, Repository.permission.model, function(txRoleRepository, txPermissionRepository) {

        var getRoleById = txRoleRepository.findOne(id).eager('permissions');
        var getPermissionsById = permissionIds.map(function(permissionId) {
            return txPermissionRepository.findOne(permissionId);
        });

        return Promise.join(getRoleById, Promise.all(getPermissionsById), function(role, permissions) {

            var permDoesNotExist, permNotInRole;

            if (!role) {
                throw HSError.RESOURCE_NOT_FOUND;
            }

            permDoesNotExist = permissions.some(function(permission) {
                return !permission;
            });

            if (permDoesNotExist) {
                throw HSError.RESOURCE_NOT_FOUND;
            }

            //check if the role has this permission
            permNotInRole = permissionIds.some(function(permId) {
                var rolePermissionIds = role.permissions.map(function(rolePermission) {
                    return rolePermission.id;
                });
                return rolePermissionIds.indexOf(permId) === -1;
            });

            if (permNotInRole) {
                throw HSError.RESOURCE_NOT_FOUND;
            }

            return Promise.all(permissionIds.map(function(permissionId) {
                return role.$relatedQuery('permissions').unrelate().where('id', permissionId);
            }));
        });
    });
};
