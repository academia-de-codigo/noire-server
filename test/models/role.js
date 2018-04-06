const Lab = require('lab');
const RoleModel = require('models/role');
const BaseModel = require('models/base');

const { describe, expect, it } = (exports.lab = Lab.script());

describe('Model: role', () => {
    it('extends from base model', () => {
        // exercise
        let roleModel = new RoleModel();

        // verify
        expect(roleModel).to.be.an.instanceof(BaseModel);
    });

    it('should persist to a table named role', () => {
        expect(RoleModel.tableName).to.equals('role');
    });

    it('should contain a schema', () => {
        expect(RoleModel.jsonSchema).to.be.an.object();
    });

    it('should contain many-to-many relation mappings to role model', () => {
        expect(RoleModel.relationMappings).to.be.an.object();
        expect(RoleModel.relationMappings.users).to.exist();
        expect(RoleModel.relationMappings.users.relation).to.equals(BaseModel.ManyToManyRelation);
    });

    it('should contain many-to-many relation mappings to permission model', () => {
        expect(RoleModel.relationMappings).to.be.an.object();
        expect(RoleModel.relationMappings.permissions).to.exist();
        expect(RoleModel.relationMappings.permissions.relation).to.equals(
            BaseModel.ManyToManyRelation
        );
    });
});
