'use strict';

var Model = require('./base');

function User() {
    Model.apply(this, arguments);
}

Model.extend(User);
module.exports = User;

User.USERNAME_MIN_LENGTH = 3;
User.USERNAME_MAX_LENGTH = 32;

User.PASSWORD_MIN_LENGTH = 3;
User.PASSWORD_MAX_LENGTH = 32;

User.tableName = 'user';
User.jsonSchema = {
    type: 'object',
    required: [],
    properties: {
        id: {
            type: 'integer'
        },
        username: {
            type: 'string',
            minLength: User.USERNAME_MIN_LENGTH,
            maxLength: User.USERNAME_MAX_LENGHT
        },
        email: {
            type: 'string',
            format: 'email'
        },
        password: {
            type: 'string',
            minLength: User.PASSWORD_MIN_LENGTH,
            maxLength: User.PASSWORD_MAX_LENGHT
        }
    }
};

User.relationMappings = {
    roles: {
        relation: Model.ManyToManyRelation,
        modelClass: 'role',
        join: {
            from: 'user.id',
            through: {
                from: 'user_role.user_id',
                to: 'user_role.role_id'
            },
            to: 'role.id'
        }
    }
};
