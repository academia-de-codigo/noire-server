/**
 * Permission Service
 * @module
 */
const Hoek = require('hoek');
const NSError = require('errors/nserror');
const Repository = require('plugins/repository');
const Action = require('utils/action');

/**
 * Counts the number of permissions
 * @param {Object} [criteria] the search criteria
 * @returns {Promise<number>} the number of permissions
 */
exports.count = async function(criteria = {}) {
    return (await Repository.Permission.count({ ...criteria, relations: 'resource' })).count;
};

/**
 * Retrieves all permissions
 * @param {Object} [criteria] the search criteria
 * @returns {Promise<Role[]>} all retrieved permissions
 */
exports.list = function(criteria) {
    return Repository.Permission.findAll({ ...criteria, relations: 'resource' })
        .omit(['resourceId'])
        .eager('resource');
};

/**
 * Retrieves a permission by its id
 * @async
 * @param {number} id the permission id
 * @returns {Promise<Role>} the retrieved permission
 */
exports.findById = async function(id) {
    const permission = await Repository.Permission.findOne(id)
        .omit(['resourceId'])
        .eager('resource');

    if (!permission) {
        throw NSError.RESOURCE_NOT_FOUND();
    }

    return permission;
};

/**
 * Creates a permission
 * @param {Permission} entity the permission to save
 * @returns {Promise<Role>} the created permission
 */
exports.add = function(entity) {
    if (!Action.isAction(entity.action)) {
        throw NSError.RESOURCE_NOT_FOUND('Invalid action');
    }

    // transaction protects against duplicates caused by simultaneous add
    return Repository.tx(
        [Repository.Permission.model, Repository.Resource.model],
        async (txPermissionRepository, txResourceRepository) => {
            const resource = await txResourceRepository.query().findOne({ name: entity.resource });

            if (!resource) {
                throw NSError.RESOURCE_NOT_FOUND('Invalid resource name');
            }

            const permission = await txPermissionRepository
                .query()
                .findOne({ action: entity.action, resourceId: resource.id });

            if (permission) {
                throw NSError.RESOURCE_DUPLICATE();
            }

            return txPermissionRepository.add({
                action: entity.action,
                description: entity.description,
                resourceId: resource.id
            });
        }
    );
};

/**
 * Removes a permission
 * @param {number} id the permission id
 * @returns {Promise} resolved if the transaction was committed with success
 */
exports.delete = function(id) {
    return Repository.tx(Repository.Permission.model, async txPermissionRepository => {
        const permission = await txPermissionRepository.findOne(id).eager('roles');

        if (!permission) {
            throw NSError.RESOURCE_NOT_FOUND();
        }

        if (permission.roles.length !== 0) {
            throw NSError.RESOURCE_RELATION();
        }

        const count = await txPermissionRepository.remove(id);

        if (count !== 1) {
            throw NSError.RESOURCE_DELETE();
        }
    });
};

/**
 * Updates an existing permission
 * @param {number} id the id of the permission to update
 * @param {Permission} entity the permission to update
 * @returns {Promise<Resource>} the updated permission
 */
exports.update = function(id, entity) {
    return Repository.tx(Repository.Permission.model, async txPermissionRepository => {
        const permission = await txPermissionRepository.findOne(id);

        if (!permission) {
            throw NSError.RESOURCE_NOT_FOUND();
        }

        Hoek.merge(permission, Hoek.cloneWithShallow(entity, ['description']));

        return txPermissionRepository.update(permission);
    });
};
