var Boom = require('boom');

var error = {
    AUTH_INVALID_USERNAME: 'invalid username/password',
    AUTH_INVALID_PASSWORD: 'invalid username/password',
    AUTH_UNAUTHORIZED: 'insufficient privileges',
    AUTH_ERROR: 'authentication error',
    AUTH_CRYPT_ERROR: 'encryption error',
    RESOURCE_FETCH: 'error fetching resource',
    RESOURCE_DELETE: 'error deleting resource',
    RESOURCE_INSERT: 'error creating resource',
    RESOURCE_UPDATE: 'error updating resource',
    RESOURCE_NOT_FOUND: 'resource not found',
    RESOURCE_DUPLICATE: 'resource already exists',
    RESOURCE_RELATION: 'resource contains associated resources',
    RESOURCE_STATE: 'resource is not in a valid state for this action'
};

module.exports = error;

error.toBoom = function(err) {

    if (err.isBoom) {
        return err;
    }

    // catch lib errors (eg. knex) and attach error message for proper logging
    if (err instanceof Error) {
        return Boom.badImplementation(null, err.message);
    }

    var boomError;
    switch (err) {
        case error.AUTH_INVALID_USERNAME:
        case error.AUTH_INVALID_PASSWORD:
            boomError = Boom.unauthorized(err);
            break;
        case error.AUTH_UNAUTHORIZED:
            boomError = Boom.forbidden(err);
            break;
        case error.RESOURCE_NOT_FOUND:
            boomError = Boom.notFound(err);
            break;
        case error.RESOURCE_RELATION:
        case error.RESOURCE_DUPLICATE:
        case error.RESOURCE_STATE:
            boomError = Boom.conflict(err);
            break;
        default:
            boomError = Boom.badImplementation(err);
            break;
    }

    return boomError;
};
