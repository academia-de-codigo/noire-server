const Lab = require('@hapi/lab');
const BaseModel = require('models/base');
const ResourceModel = require('models/authorization/resource');

const { describe, expect, it } = (exports.lab = Lab.script());

describe('Model: resource', () => {
    it('extends from base model', () => {
        // exercise
        var resourceModel = new ResourceModel();

        // verify
        expect(resourceModel).to.be.an.instanceof(BaseModel);
    });

    it('should persist to a table named resource', () => {
        expect(ResourceModel.tableName).to.equals('resources');
    });

    it('should contain a schema', () => {
        expect(ResourceModel.jsonSchema).to.be.an.object();
    });

    it('should contain relation mappings to permission model', () => {
        expect(ResourceModel.relationMappings).to.be.an.object();
        expect(ResourceModel.relationMappings.permissions).to.exist();
        expect(ResourceModel.relationMappings.permissions.relation).to.equals(
            BaseModel.HasManyRelation
        );
    });
});
