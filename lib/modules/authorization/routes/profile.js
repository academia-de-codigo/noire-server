/**
 * API profile routes
 * @module
 */
const ProfileCtrl = require('modules/authorization/controllers/profile');
const Validator = require('modules/authorization/validators/profile');
const { documentationTags } = require('config');

const tags = documentationTags.authorization;

const descriptions = {
    update: [
        'The new username',
        'The new name',
        'The new email',
        'The new password',
        'The new user avatar URI'
    ]
};

// GET /profile
exports.get = {
    description: 'Get the user profile',
    handler: ProfileCtrl.get,
    tags
};

// PUT /profile
exports.update = {
    description: 'Update the user profile',
    handler: ProfileCtrl.update,
    tags,
    validate: {
        payload: Validator.validateProfileUpdateFields(...descriptions.update)
    }
};
