const Lab = require('lab');
const BaseModel = require('models/base');
const UserModel = require('models/user');

const { describe, expect, it } = (exports.lab = Lab.script());

describe('Model: user', () => {
    it('extends from base model', () => {
        // exercise
        let userModel = new UserModel();

        // verify
        expect(userModel).to.be.an.instanceof(BaseModel);
    });

    it('should persist to a table named user', () => {
        expect(UserModel.tableName).to.equals('user');
    });

    it('should contain a schema', () => {
        expect(UserModel.jsonSchema).to.be.an.object();
    });

    it('should contain many-to-many relation mappings to role model', () => {
        expect(UserModel.relationMappings).to.be.an.object();
        expect(UserModel.relationMappings.roles).to.exist();
        expect(UserModel.relationMappings.roles.relation).to.equals(BaseModel.ManyToManyRelation);
    });
});
