var Joi = require('joi');
var ProfileCtrl = require('../../controllers/api/profile');
var User = require('../../models/user');

// PUT /profile
exports.update = {
    description: 'Updates own profile',
    handler: ProfileCtrl.update,
    auth: {
        scope: 'user'
    },
    plugins: {
        stateless: false
    },
    validate: {
        payload: {
            id: Joi.forbidden(),
            username: Joi.string().min(User.USERNAME_MIN_LENGTH).max(User.USERNAME_MAX_LENGTH).required(),
            name: Joi.string().min(User.NAME_MIN_LENGTH).max(User.NAME_MAX_LENGTH),
            email: Joi.string().email(),
            password: Joi.string().min(User.PASSWORD_MIN_LENGTH).max(User.PASSWORD_MAX_LENGTH),
            active: Joi.boolean(),
            roles: Joi.forbidden()
        }
    }
};
