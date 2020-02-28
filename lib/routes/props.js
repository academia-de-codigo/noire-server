/**
 * Api properties route
 * @module
 */
const Enums = require('enums');
const Roles = Enums.roles;
const { documentationTags } = require('config');

const tags = documentationTags.props;

// GET /props
exports.get = {
    description: 'Returns the server props',
    handler: () => Enums,
    tags,
    auth: {
        scope: Roles.ADMIN
    }
};
