const Lab = require('@hapi/lab');
const Objection = require('objection');
const BaseModel = require('models/base');

const { before, describe, expect, it } = (exports.lab = Lab.script());

describe('Model: base', function() {
    let baseModel;

    before(() => {
        baseModel = new BaseModel();
    });

    it('fectches relation models from the models directory', () => {
        expect(BaseModel.modelPaths[0]).to.endsWith('/lib/models');
    });

    it('should persist timestamp fields', () => {
        expect(BaseModel.pickJsonSchemaProperties).to.be.false();
    });

    it('extends from objection model', () => {
        expect(baseModel).to.be.an.instanceof(Objection.Model);
    });

    it('should set created timestamp before creating new record', () => {
        // exercise
        baseModel.$beforeInsert();

        // verify
        expect(baseModel.createdAt).to.exist();
        expect(Date.parse(baseModel.createdAt)).to.be.a.number();
    });

    it('should set updated timestamp before record update', () => {
        // exercise
        baseModel.$beforeUpdate();

        // verify
        expect(baseModel.updatedAt).to.exist();
        expect(Date.parse(baseModel.updatedAt)).to.be.a.number();
    });

    it('should remove created timestamp after creating new record', () => {
        // exercise
        baseModel.$beforeInsert();
        baseModel.$afterInsert();

        // verify
        expect(baseModel.createdAt).not.to.exist();
    });

    it('should remove updated timestamp after record update', () => {
        // exercise
        baseModel.$beforeUpdate();
        baseModel.$afterUpdate();

        // verify
        expect(baseModel.updatedAt).not.to.exist();
    });

    it('should remove all timestamps after record get', () => {
        // exercise
        baseModel.$beforeInsert();
        baseModel.$beforeUpdate();
        baseModel.$afterGet();

        // verify
        expect(baseModel.updatedAt).not.to.exist();
        expect(baseModel.createdAt).not.to.exist();
    });

    it('should not parse database json if there is no jsonSchema', () => {
        //setup
        const fakeJson = { id: 1 };

        //exercise
        const parsedJson = baseModel.$parseDatabaseJson(fakeJson);

        //verify
        expect(parsedJson).to.be.equal(fakeJson);
    });

    it('should not parse database json if jsonSchema has no properties', () => {
        let baseModelSchema = BaseModel.jsonSchema;

        //setup
        const fakeSchema = {
            type: 'object'
        };

        const fakeJson = { id: 1 };
        BaseModel.jsonSchema = fakeSchema;

        //exercise
        const parsedJson = baseModel.$parseDatabaseJson(fakeJson);

        //verify
        expect(parsedJson).to.be.equal(fakeJson);

        //cleanup
        BaseModel.jsonSchema = baseModelSchema;
    });

    it('should not parse database json if jsonSchema properties have no type', () => {
        let baseModelSchema = BaseModel.jsonSchema;

        //setup
        const fakeSchema = {
            type: 'object',
            properties: { exists: { default: 0 } }
        };

        const fakeJson = { exists: 1 };
        BaseModel.jsonSchema = fakeSchema;

        //exercise
        const parsedJson = baseModel.$parseDatabaseJson(fakeJson);

        //verify
        expect(parsedJson).to.be.equal(fakeJson);

        //cleanup
        BaseModel.jsonSchema = baseModelSchema;
    });

    it('should convert database json boolean type properties to boolean values', () => {
        let baseModelSchema = BaseModel.jsonSchema;
        //setup
        const fakeSchema = {
            type: 'object',
            properties: { exists: { type: 'boolean' } }
        };

        const fakeExistant = { exists: 1 };
        const fakeNonExistant = { exists: 0 };
        BaseModel.jsonSchema = fakeSchema;

        //exercise
        const parsedExistantEntity = baseModel.$parseDatabaseJson(fakeExistant);
        const parsedNonExistantEntity = baseModel.$parseDatabaseJson(fakeNonExistant);

        //verify
        expect(parsedExistantEntity.exists).to.be.true();
        expect(parsedNonExistantEntity.exists).to.be.false();

        //cleanup
        BaseModel.jsonSchema = baseModelSchema;
    });

    it('should not change json boolean type properties if already boolean values', () => {
        let baseModelSchema = BaseModel.jsonSchema;
        //setup
        const fakeSchema = {
            type: 'object',
            properties: { exists: { type: 'boolean' } }
        };

        const fakeExistant = { exists: true };
        const fakeNonExistant = { exists: false };
        BaseModel.jsonSchema = fakeSchema;

        //exercise
        const parsedExistantEntity = baseModel.$parseDatabaseJson(fakeExistant);
        const parsedNonExistantEntity = baseModel.$parseDatabaseJson(fakeNonExistant);

        //verify
        expect(parsedExistantEntity).to.be.equal(fakeExistant);
        expect(parsedNonExistantEntity).to.be.equal(fakeNonExistant);

        //cleanup
        BaseModel.jsonSchema = baseModelSchema;
    });

    it('should not convert database json integer type properties to boolean values', () => {
        let baseModelSchema = BaseModel.jsonSchema;
        //setup
        const fakeSchema = {
            type: 'object',
            properties: { id: { type: 'integer' }, name: { type: 'string' } }
        };

        const fakeEntityZero = { id: 0, name: '0' };
        const fakeEntityOne = { id: 1, name: '1' };
        BaseModel.jsonSchema = fakeSchema;

        //exercise
        const parsedEntityZero = baseModel.$parseDatabaseJson(fakeEntityZero);
        const parsedEntityOne = baseModel.$parseDatabaseJson(fakeEntityOne);

        //verify
        expect(parsedEntityZero.id).to.be.equal(0);
        expect(parsedEntityZero.name).to.be.equal('0');
        expect(parsedEntityOne.id).to.be.equal(1);
        expect(parsedEntityOne.name).to.be.equal('1');

        //cleanup
        BaseModel.jsonSchema = baseModelSchema;
    });
});
