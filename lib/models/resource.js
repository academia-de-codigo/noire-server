var Model = require('./base');

function Resource() {
    Model.apply(this, arguments);
}

Model.extend(Resource);
module.exports = Resource;

Resource.NAME_MIN_LENGTH = 3;
Resource.NAME_MAX_LENGTH = 16;

// Default limit for rows returned when using findAll
Resource.LIMIT_DEFAULT = 10;

Resource.tableName = 'resource';
Resource.jsonSchema = {
    type: 'object',
    required: ['name'],
    properties: {
        id: {
            type: 'integer'
        },
        name: {
            type: 'string'
        }
    }
};

Resource.relationMappings = {
    permissions: {
        relation: Model.HasManyRelation,
        modelClass: 'permission',
        join: {
            from: 'permission.resource_id',
            to: 'resource.id'
        }
    }
};
