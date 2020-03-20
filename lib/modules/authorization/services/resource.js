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
    return (await Repository.Resource.count(criteria)).count;
};

/**
 * Retrieves all existing resources with associated permissions
 * @param {(number|string|Object)} [criteria] search criteria
 * @returns {Promise<Resource[]>} all retrieved resources
 */
exports.list = function(criteria) {
    return Repository.Resource.findAll(criteria).withGraphFetched('permissions');
};

/**
 * Retrieves a resource by its id
 * @async
 * @param {number} id the resource id
 * @returns {Promise<Resource>} the retrieved resrouce
 */
exports.findById = async function(id) {
    const resource = await Repository.Resource.findOne(id);

    if (!resource) {
        throw NSError.RESOURCE_NOT_FOUND();
    }

    return resource;
};

/**
 * Retrieves a resource by its name
 * @async
 * @param {string} name the resource name
 * @return {Promise<Resource>} the retrieved resource
 */
exports.findByName = async function(name) {
    const resource = await Repository.Resource.query().findOne({ name });

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
    return Repository.tx(Repository.Resource.model, async txResourceRepository => {
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
 * @returns {Promise} resolved if the transaction was committed with success
 */
exports.delete = function(id) {
    return Repository.tx(Repository.Resource.model, async txResourceRepository => {
        const resource = await txResourceRepository.findOne(id).withGraphFetched('permissions');

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
    return Repository.tx(Repository.Resource.model, async txResourceRepository => {
        const getResourceById = txResourceRepository.findOne(id);
        const getEqualResources = entity.name
            ? txResourceRepository.query().where('name', entity.name)
            : Promise.resolve([]);

        const [resource, equalResources] = await Promise.all([getResourceById, getEqualResources]);

        if (!resource) {
            throw NSError.RESOURCE_NOT_FOUND();
        }

        // name is already taken, we should not update
        if (equalResources.length > 0 && equalResources[0].id !== id) {
            throw NSError.RESOURCE_DUPLICATE();
        }

        resource.name = entity.name;
        resource.description = entity.description ? entity.description : resource.description;
        return txResourceRepository.update(resource);
    });
};
