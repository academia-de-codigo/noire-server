const Lab = require('lab');
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
        expect(baseModel.created_at).to.exist();
        expect(Date.parse(baseModel.created_at)).to.be.a.number();
    });

    it('should set updated timestamp before record update', () => {
        // exercise
        baseModel.$beforeUpdate();

        // verify
        expect(baseModel.updated_at).to.exist();
        expect(Date.parse(baseModel.updated_at)).to.be.a.number();
    });

    it('should remove created timestamp after creating new record', () => {
        // exercise
        baseModel.$beforeInsert();
        baseModel.$afterInsert();

        // verify
        expect(baseModel.created_at).not.to.exist();
    });

    it('should remove updated timestamp after record update', () => {
        // exercise
        baseModel.$beforeUpdate();
        baseModel.$afterUpdate();

        // verify
        expect(baseModel.updated_at).not.to.exist();
    });

    it('should remove all timestamps after record get', () => {
        // exercise
        baseModel.$beforeInsert();
        baseModel.$beforeUpdate();
        baseModel.$afterGet();

        // verify
        expect(baseModel.updated_at).not.to.exist();
        expect(baseModel.created_at).not.to.exist();
    });
});
