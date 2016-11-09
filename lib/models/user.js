'use strict';

var Model = require('./base');

function User() {
    Model.apply(this, arguments);
}

Model.extend(User);
module.exports = User;

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
            minLength: 1,
            maxLength: 255
        },
        email: {
            type: 'string',
            format: 'email'
        },
        password: {
            type: 'string',
            minLength: 3,
            maxLength: 32
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
