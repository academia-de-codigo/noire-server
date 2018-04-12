/**
 * Resource Service
 * @module
 */
const NSError = require('errors/nserror');
const Repository = require('plugins/repository');

/**
 * Counts the number of resources
 * @param {Object} [criteria] search criteria
 * @returns {Promise<number} the number of resources
 */
exports.count = async function(criteria) {
    const result = await Repository.resource.count(criteria);
    return result.count;
};

/**
 * Retreives all resources
 * @param {(number)|string|Object)} [criteria] search criteria
 * @returns {Promise<Resource[]>} all retreived resources
 */
exports.list = function(criteria) {
    return Repository.resource.findAll(criteria);
};

/**
 * Retreives a resource by its id
 * @async
 * @param {number} id the resource id
 * @returns {Promise<Resource>} the retreived resrouce
 */
exports.findById = async function(id) {
    const resource = await Repository.resource.findOne(id);

    if (!resource) {
        throw NSError.RESOURCE_NOT_FOUND();
    }

    return resource;
};

/**
 * Retreives a resource by its name
 * @async
 * @param {string} name the resource name
 * @return {Promise<Resource>} the retreived resource
 */
exports.findByName = async function(name) {
    const resource = await Repository.resource.query().findOne({ name });

    if (!resource) {
        throw NSError.RESOURCE_NOT_FOUND();
    }

    return resource;
};

/**
 * Saves a resource
 * @param {Resource} entity the resource to save
 * @returns {Promise<Resource>} the added resource
 */
exports.add = function(entity) {
    // transaction protects against duplicates caused by simultaneous add
    return Repository.tx(Repository.resource.model, async txResourceRepository => {
        const resource = await txResourceRepository.query().findOne({ name: entity.name });

        if (resource) {
            throw NSError.RESOURCE_DUPLICATE();
        }

        return txResourceRepository.add(entity);
    });
};

/**
 * Removes a resource
 * @param {number} id the resource id
 * @returns {Promise} resolved if the transaction was commited with success
 */
exports.delete = function(id) {
    return Repository.tx(Repository.resource.model, async txResourceRepository => {
        const resource = await txResourceRepository.findOne(id).eager('permissions');

        if (!resource) {
            throw NSError.RESOURCE_NOT_FOUND();
        }

        if (resource.permissions.length !== 0) {
            throw NSError.RESOURCE_RELATION();
        }

        const count = await txResourceRepository.remove(id);

        if (count !== 1) {
            throw NSError.RESOURCE_DELETE();
        }

        return;
    });
};

/**
 * Updates an existing resource
 * @param {number} id the id of the resource to update
 * @param {Resource} entity the resource to update
 * @returns {Promise<Resource>} the updated resource
 */
exports.update = function(id, entity) {
    // transaction makes sure we do not end up with resources with the same name
    return Repository.tx(Repository.resource.model, async txResourceRepository => {
        const getResourceById = txResourceRepository.findOne(id);
        const getEqualResources = txResourceRepository
            .query()
            .skipUndefined()
            .where('name', entity.name);

        const [resource, equalResources] = await Promise.all([getResourceById, getEqualResources]);

        if (!resource) {
            throw NSError.RESOURCE_NOT_FOUND();
        }

        // name is already taken, we should not update
        if (equalResources.length > 0 && equalResources[0].id !== id) {
            throw NSError.RESOURCE_DUPLICATE();
        }

        resource.name = entity.name;
        return txResourceRepository.update(resource);
    });
};
