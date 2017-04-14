var Promise = require('bluebird');
var HSError = require('../error');
var Repository = require('../plugins/repository');

var internals = {};

internals.findAllBySearchCriteria = function(criteria) {
    return Repository.resource.findAll(criteria)
        .where('name', 'like', '%' + criteria.search + '%');
};

exports.count = function(criteria) {

    if (criteria && criteria.search) {

        // we only want to use the search param to build the subquery
        criteria = {
            search: criteria.search
        };

        return Repository.resource.query().count('* as count')
            .from(internals.findAllBySearchCriteria(criteria).as('ignored_alias'))
            .then(function(result) {
                return result[0].count;
            });
    }

    return Repository.resource.query().count('* as count').then(function(result) {
        return result[0].count;
    });
};

exports.list = function(criteria) {

    if (criteria && criteria.search) {
        return internals.findAllBySearchCriteria(criteria);
    }

    return Repository.resource.findAll(criteria);
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

        var getResourceById = txResourceRepository.findOne(id);
        var getPermissionsByResource = txPermissionRepository.query().where('resource_id', id);

        return Promise.join(getResourceById, getPermissionsByResource, function(resource, permissions) {

            if (!resource) {
                throw HSError.RESOURCE_NOT_FOUND;
            }

            if (permissions && permissions.length !== 0) {
                throw HSError.RESOURCE_RELATION;
            }

            return txResourceRepository.remove(id);

        }).then(function(count) {

            if (count !== 1) {
                throw HSError.RESOURCE_DELETE;
            }

            return;
        });
    });
};

exports.update = function(id, entity) {

    return Repository.tx(Repository.resource.model, function(txResourceRepository) {

        var getResourceById = txResourceRepository.findOne(id);
        var getDuplicateResources = txResourceRepository.query().where('name', entity.name);

        return Promise.join(getResourceById, getDuplicateResources, function(resource, duplicateResources) {

            if (!resource) {
                throw HSError.RESOURCE_NOT_FOUND;
            }

            if (duplicateResources.length > 0) {
                throw HSError.RESOURCE_DUPLICATE;
            }

            resource.name = entity.name;
            return txResourceRepository.update(resource);
        });
    });
};
