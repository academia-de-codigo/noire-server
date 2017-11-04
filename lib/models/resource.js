const BaseModel = require('./base');

/**
 * Resource Model
 * @class Resource
 * @extends {BaseModel}
 */
class Resource extends BaseModel {}

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
        relation: BaseModel.HasManyRelation,
        modelClass: 'permission',
        join: {
            from: 'permission.resource_id',
            to: 'resource.id'
        }
    }
};
