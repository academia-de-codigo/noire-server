var Model = require('./base');

class Role extends Model {}

module.exports = Role;

Role.NAME_MIN_LENGTH = 3;
Role.NAME_MAX_LENGTH = 16;

Role.DESC_MAX_LENGTH = 1024;

// Default limit for rows returned when using findAll
Role.LIMIT_DEFAULT = 10;

Role.tableName = 'role';
Role.jsonSchema = {
    type: 'object',
    required: ['name'],
    properties: {
        id: {
            type: 'integer'
        },
        name: {
            type: 'string',
            minLength: Role.NAME_MIN_LENGTH,
            maxLength: Role.NAME_MAX_LENGTH
        },
        description: {
            type: 'string',
            maxLength: Role.DESC_MAX_LENGTH
        }
    }
};

Role.relationMappings = {
    users: {
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
    },
    permissions: {
        relation: Model.ManyToManyRelation,
        modelClass: 'permission',
        join: {
            from: 'role.id',
            through: {
                from: 'role_permission.role_id',
                to: 'role_permission.permission_id'
            },
            to: 'permission.id'
        }
    }
};
