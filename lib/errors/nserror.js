/**
 * Noire server errors
 * @module
 */
const Errors = require('./errors.json'); // used to store mapping between error messages and http codes
const Boom = require('boom');

const internals = {};

internals.boomFromStr = function(error) {
    return () => Boom.badImplementation(error, { timestamp: Date.now() });
};

internals.boomFromObj = function(error) {
    return () => new Boom(error.message, {

        statusCode: error.statusCode,
        data: {
            timestamp: Date.now()
        }
    });
};

internals.init = function() {

    for (let error in Errors) {
        let errorObj = Errors[error];
        exports[error] = (typeof errorObj === 'string' ? internals.boomFromStr(errorObj) : internals.boomFromObj(errorObj));
    }
};

internals.init();

/**
 * Creates a new boom error object
 * @param {any} error
 * @returns {Error} the bom decorated error object
 */
exports.create = function(error) {

    let errorWrap;

    // do nothing if error is boom
    if (error.isBoom) {
        errorWrap = error;
    }

    // catch lib errors (eg. knex) and attach error message for proper logging
    if (error instanceof Error) {
        errorWrap = Boom.boomify(error);
    }

    if (typeof error === 'string') {
        errorWrap = Boom.boomify(new Error(error));
    }

    // every other attempt at boom decorating failed
    if (!error.isBoom) {
        errorWrap = Boom.badImplementation(error);
    }

    errorWrap.data = errorWrap.data || { timestamp: Date.now() };

    return errorWrap;
};
