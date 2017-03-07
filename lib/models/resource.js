'use strict';

var Model = require('./base');

function Resource() {
    Model.apply(this, arguments);
}

Model.extend(Resource);
module.exports = Resource;

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
