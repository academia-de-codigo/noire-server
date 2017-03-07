'use strict';
var Code = require('code'); // the assertions library
var Lab = require('lab'); // the test framework
var ResourceModel = require('../../lib/models/resource');
var Model = require('../../lib/models/base');

var lab = exports.lab = Lab.script(); // export the test script

// make lab feel like jasmine
var describe = lab.experiment;
var it = lab.test;
var expect = Code.expect;

describe('Model: resource', function() {

    it('extends from base model', function(done) {

        var resourceModel = new ResourceModel();
        expect(resourceModel).to.be.an.instanceof(Model);
        done();
    });

    it('should persist to a table named resource', function(done) {
        expect(ResourceModel.tableName).to.equals('resource');
        done();
    });

    it('should contain a schema', function(done) {
        expect(ResourceModel.jsonSchema).to.be.an.object();
        done();
    });
});
