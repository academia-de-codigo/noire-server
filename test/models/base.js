var Code = require('code'); // the assertions library
var Lab = require('lab'); // the test framework
var Objection = require('objection');
var BaseModel = require('../../lib/models/base');

var lab = exports.lab = Lab.script(); // export the test script
var before = lab.before;

// make lab feel like jasmine
var describe = lab.experiment;
var it = lab.test;
var expect = Code.expect;

describe('Model: base', function() {

    var baseModel;

    before(function(done) {
        baseModel = new BaseModel();
        done();
    });

    it('it fectches relation models from the models directory', function(done) {
        var path = BaseModel.modelPaths[0];
        expect(path).to.endsWith('/lib/models');
        done();
    });

    it('should persist timestamp fields', function(done) {
        expect(BaseModel.pickJsonSchemaProperties).to.be.false();
        done();
    });

    it('extends from objection model', function(done) {

        expect(baseModel).to.be.an.instanceof(Objection.Model);
        done();
    });

    it('should set created timestamp before record creation', function(done) {

        baseModel.$beforeInsert();
        expect(baseModel.created_at).to.exist();
        expect(Date.parse(baseModel.created_at)).to.be.a.number();
        done();
    });

    it('should set updated timestamp before record update', function(done) {

        baseModel.$beforeUpdate();
        expect(baseModel.updated_at).to.exist();
        expect(Date.parse(baseModel.updated_at)).to.be.a.number();
        done();
    });

    it('should remove created timestamp after record creation', function(done) {

        baseModel.$beforeInsert();
        baseModel.$afterInsert();
        expect(baseModel.created_at).not.to.exist();
        done();
    });

    it('should remove updated timestamp after record update', function(done) {

        baseModel.$beforeUpdate();
        baseModel.$afterUpdate();
        expect(baseModel.updated_at).not.to.exist();
        done();
    });

    it('should remove all timestamps after record get', function(done) {

        baseModel.$beforeInsert();
        baseModel.$beforeUpdate();
        baseModel.$afterGet();
        expect(baseModel.updated_at).not.to.exist();
        expect(baseModel.created_at).not.to.exist();
        done();
    });

});
