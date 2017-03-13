'use strict';

var Promise = require('bluebird');
var HSError = require('../error');
var Action = require('../action');
var Repository = require('../plugins/repository');

exports.canUser = function(username, action, resourceName) {

    var user = null;
    return Repository.user.query().where('username', username).eager('roles').then(function(users) {

        user = users[0];

        if (!user) {
            throw HSError.RESOURCE_NOT_FOUND;
        }

        if (!user.roles) {
            return Promise.resolve(false);
        }

        return Promise.reduce(user.roles, function(acc, role) {

            // role with proper access rights found,
            // no need to evaluate other roles, break from the promise chain
            if (acc === true) {
                return true;
            }

            return exports.canRole(role.name, action, resourceName);

        }, false);

        /* simpler, but requires going through all roles
        return Promise.map(user.roles, function(role) {
            return exports.canRole(role.name, action, resourceName);
        }).then(function(results) {
            return results.some(function(result) {
                return result;
            });
        });*/
    });
};

exports.canRole = function(roleName, action, resourceName) {

    var resource = null;
    var role = null;
    return Repository.resource.query().where('name', resourceName).then(function(resources) {

        resource = resources[0];

        if (!resource) {
            throw HSError.RESOURCE_NOT_FOUND;
        }

        return Repository.role.query().where('name', roleName).then(function(roles) {

            role = roles[0];

            if (!role) {
                throw HSError.RESOURCE_NOT_FOUND;
            }

            return role.$relatedQuery('permissions').eager('resources')
                .where('action', action)
                .andWhere('resource_id', resource.id)
                .then(function(permissions) {

                    return permissions && permissions.length > 0;
                });
        });
    });
};

exports.addPermission = function(action, resourceName) {

    if (!Object.keys(Action).some(function(key) {
            return Action[key] === action;
        })) {
        return Promise.reject(HSError.RESOURCE_NOT_FOUND);
    }

    return Repository.tx(Repository.permission.model, Repository.resource.model, function(txPermissionRepository, txResourceRepository) {

        return txResourceRepository.query().where('name', resourceName).then(function(resources) {

            if (resources.length === 0) {
                throw HSError.RESOURCE_NOT_FOUND;
            }

            return txPermissionRepository.add({
                action: action
            }).then(function(permission) {
                return permission.$relatedQuery('resources').relate(resources[0].id);
            });
        });
    });
};