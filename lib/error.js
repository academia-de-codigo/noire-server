'use strict';

var Boom = require('boom');

var error = {
    AUTH_INVALID_USERNAME: 'invalid username',
    AUTH_INVALID_PASSWORD: 'invalid password',
    AUTH_ERROR: 'authentication error',
    AUTH_CRYPT_ERROR: 'encryption error',
    RESOURCE_FETCH: 'error fetching resource',
    RESOURCE_DELETE: 'error deleting resource',
    RESOURCE_INSERT: 'error creating resource',
    RESOURCE_UPDATE: 'error updating resource',
    RESOURCE_NOT_FOUND: 'resource not found',
    RESOURCE_DUPLICATE: 'resource already exists',
    RESOURCE_RELATION: 'resource contains associated resources'
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
        case error.RESOURCE_NOT_FOUND:
            boomError = Boom.notFound(err);
            break;
        case error.RESOURCE_RELATION:
        case error.RESOURCE_DUPLICATE:
            boomError = Boom.conflict(err);
            break;
        default:
            boomError = Boom.badImplementation(err);
            break;
    }

    return boomError;
};
