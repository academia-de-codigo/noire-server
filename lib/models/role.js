'use strict';

var Model = require('objection').Model;

function Role() {
    Model.apply(this, arguments);
}

Model.extend(Role);
module.exports = Role;

Role.tableName = 'role';
Role.modelPaths = [__dirname];

Role.jsonSchema = {
    type: 'object',
    required: ['name'],
    properties: {
        id: {
            type: 'integer'
        },
        name: {
            type: 'string',
            minLength: 1,
            maxLength: 255
        }
    }
};

Role.relationMappings = {
    user: {
        relation: Model.ManyToManyRelation,
        modelClass: 'user',
        join: {
            from: 'role.id',
            through: { // ManyToMany relation needs the `through` object to describe the join table.
                from: 'user_role.role_id',
                to: 'user_role.user_id'
            },
            to: 'user.id'
        }
    }
};
