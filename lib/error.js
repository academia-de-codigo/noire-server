'use strict';

var Boom = require('boom');

var error =  {
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
        case error.RESOURCE_NOT_FOUND:
            boomError = Boom.badRequest(err);
            break;
        case error.RESOURCE_RELATION:
            boomError = Boom.conflict(err);
            break;
        default:
            boomError = Boom.badImplementation(err);
            break;
    }

    return boomError;
};
