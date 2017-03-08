'use strict';

var HSError = require('../error');
var Repository = require('../plugins/repository');

exports.list = function() {
    return Repository.resource.findAll();
};

exports.findById = function(id) {
    return Repository.resource.findOne(id).then(function(resource) {

        if (!resource) {
            throw HSError.RESOURCE_NOT_FOUND;
        }

        return resource;
    });
};

exports.findByName = function(name) {
    return Repository.resource.query().where('name', name);
};

exports.add = function(entity) {

    return Repository.tx(Repository.resource.model, function(txResourceRepository) {

        return txResourceRepository.query().where('name', entity.name).then(function(resources) {

            if (resources.length !== 0) {
                throw HSError.RESOURCE_DUPLICATE;
            }

            return txResourceRepository.add(entity);
        });
    });
};

exports.delete = function(id) {

    return Repository.tx(Repository.resource.model, Repository.permission.model, function(txResourceRepository, txPermissionRepository) {

        return txResourceRepository.findOne(id).then(function(resource) {

            if (!resource) {
                throw HSError.RESOURCE_NOT_FOUND;
            }

            return txPermissionRepository.query().where('resource_id', id).then(function(permissions) {

                if (permissions && permissions.length !== 0) {
                    throw HSError.RESOURCE_RELATION;
                }

                return txResourceRepository.remove(id).then(function(count) {

                    if (count !== 1) {
                        throw HSError.RESOURCE_DELETE;
                    }

                    return;

                });
            });
        });
    });
};

exports.update = function(id, entity) {

    return Repository.tx(Repository.resource.model, function(txResourceRepository) {

        return txResourceRepository.findOne(id).then(function(resource) {

            if (!resource) {
                throw HSError.RESOURCE_NOT_FOUND;
            }

            return txResourceRepository.query().where('name', entity.name).then(function(equalResources) {

                if (equalResources.length > 0) {
                    throw HSError.RESOURCE_DUPLICATE;
                }

                resource.name = entity.name;
                return txResourceRepository.update(resource);
            });
        });
    });
};
