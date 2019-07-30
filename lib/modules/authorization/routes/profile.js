const Joi = require('joi');
const ProfileCtrl = require('modules/authorization/controllers/profile');
const User = require('models/authorization/user');

// GET /profile
exports.get = {
    description: 'Get the user profile',
    handler: ProfileCtrl.get
};

// PUT /profile
exports.update = {
    description: 'Update the user profile',
    handler: ProfileCtrl.update,
    validate: {
        payload: {
            username: Joi.string()
                .min(User.USERNAME_MIN_LENGTH)
                .max(User.USERNAME_MAX_LENGTH)
                .description('The new username'),
            name: Joi.string()
                .min(User.NAME_MIN_LENGTH)
                .max(User.NAME_MAX_LENGTH)
                .description('The new name'),
            email: Joi.string()
                .email()
                .description('The new email'),
            password: Joi.string()
                .min(User.PASSWORD_MIN_LENGTH)
                .max(User.PASSWORD_MAX_LENGTH)
                .description('The new password'),
            avatar: Joi.string()
                .uri({
                    scheme: ['http', 'https'],
                    allowRelative: true
                })
                .description('The new user avatar URI'),
            roles: Joi.forbidden(),
            active: Joi.forbidden()
        }
    }
};
