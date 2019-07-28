/**
 * Api properties route
 * @module
 */
const Enums = require('enums');
const Roles = Enums.roles;

// GET /props
exports.get = {
    description: 'Returns the server props',
    handler: () => Enums,
    auth: {
        scope: Roles.ADMIN
    }
};
