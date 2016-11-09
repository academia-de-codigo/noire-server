'use strict';

var Error = require('../error');
var Repository = require('../plugins/repository');

exports.list = function() {
    return Repository.role.findAll();
};

exports.findById = function(id) {
    return Repository.role.findOne(id).eager('users').omit(['password']).then(function(role) {

        if (!role) {
            throw Error.RESOURCE_NOT_FOUND;
        }

        return role;

    });
};

exports.findByName = function(name) {
    return Repository.role.query().where('name', name);
};

exports.add = function(entity) {

    return Repository.tx(Repository.role.model, function() {

        return exports.findByName(entity.name).then(function(roles) {

            if (roles.length !== 0) {
                throw Error.RESOURCE_DUPLICATE;
            }

            return Repository.role.add(entity);
        });
    });
};

exports.delete = function(id) {

    return Repository.tx(Repository.role.model, function() {

        return exports.findById(id).then(function(role) {

            if (!role) {
                throw Error.RESOURCE_NOT_FOUND;
            }

            if (role.users && role.users.length !== 0) {
                throw Error.RESOURCE_RELATION;
            }

            return Repository.role.remove(id).then(function(count) {

                if (count !== 1) {
                    throw Error.RESOURCE_DELETE;
                }

                return;
            });
        });
    });
};

exports.update = function(id, entity) {

    return Repository.tx(Repository.role.model, function() {

        return exports.findById(id).then(function(role) {

            if (!role) {
                throw Error.RESOURCE_NOT_FOUND;
            }

            return exports.findByName(entity.name).then(function(equalRole) {

                if (equalRole.length > 0) {
                    throw Error.RESOURCE_DUPLICATE;
                }

                role.name = entity.name;
                return Repository.role.update(role);
            });
        });
    });
};
