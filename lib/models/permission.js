'use strict';

var Model = require('./base');
var action = require('../plugins/authorization/action');

function Permission() {
    Model.apply(this, arguments);
}

Model.extend(Permission);
module.exports = Permission;

Permission.tableName = 'permission';
Permission.jsonSchema = {
    type: 'object',
    required: ['action'],
    properties: {
        id: {
            type: 'integer'
        },
        action: {
            type: 'string',
            enum: [action.CREATE, action.READ, action.UPDATE, action.DELETE],
            default: action.READ
        }
    }
};

Permission.relationMappings = {
    resources: {
        relation: Model.HasManyRelation,
        modelClass: 'resource',
        join: {
            from: 'permission.id',
            to: 'resource.id'
        }
    }
};
