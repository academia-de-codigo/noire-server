/**
 * Noire server errors
 * @module
 */
const Errors = require('./errors.json'); // used to store mapping between error messages and http codes
const Boom = require('@hapi/boom');

const internals = {};

internals.boomFromStr = function(error) {
    return message => Boom.badImplementation(message || error, { timestamp: Date.now() });
};

internals.boomFromObj = function(error) {
    return message =>
        new Boom(message || error.message, {
            statusCode: error.statusCode,
            data: { timestamp: Date.now() }
        });
};

internals.init = function() {
    for (let error in Errors) {
        let errorObj = Errors[error];
        let isString = typeof errorObj === 'string';

        // create new errors by invoking error property: throw NSError.RESOURCE_NOT_FOUND()
        exports[error] = isString
            ? internals.boomFromStr(errorObj)
            : internals.boomFromObj(errorObj);

        // assert error types by invoking match method: NSError.AUTH.match(error)
        exports[error].match = function(match) {
            if (match instanceof Error && match.message) {
                return isString ? errorObj === match.message : errorObj.message === match.message;
            }

            return false;
        };
    }
};

internals.init();

/**
 * Creates a new boom error object
 * @param {any} error
 * @returns {Error} the bom decorated error object
 */
exports.create = function(error) {
    let errorWrap = {};

    // do nothing if error is boom
    if (error.isBoom) {
        errorWrap = error;
    }

    // catch lib errors (eg. knex) and attach error message for proper logging
    if (!error.isBoom && error instanceof Error) {
        errorWrap = Boom.boomify(error);
    }

    if (typeof error === 'string') {
        errorWrap = Boom.badImplementation(error);
    }

    // every other attempt at boom decorating failed
    if (!errorWrap.isBoom) {
        errorWrap = Boom.badImplementation('unknown error', error);
    }

    errorWrap.data = errorWrap.data || { timestamp: Date.now() };

    return errorWrap;
};
