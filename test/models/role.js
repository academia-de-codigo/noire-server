'use strict';
var Code = require('code'); // the assertions library
var Lab = require('lab'); // the test framework
var RoleModel = require('../../lib/models/role');
var BaseModel = require('../../lib/models/base');

var lab = exports.lab = Lab.script(); // export the test script

// make lab feel like jasmine
var describe = lab.experiment;
var it = lab.test;
var expect = Code.expect;

describe('Model: role', function() {

    it('extends from base model', function(done) {

        var roleModel = new RoleModel();
        expect(roleModel).to.be.an.instanceof(BaseModel);
        done();
    });

    it('should persist to a table named role', function(done) {
        expect(RoleModel.tableName).to.equals('role');
        done();
    });

    it('should contain a schema', function(done) {
        expect(RoleModel.jsonSchema).to.be.an.object();
        done();
    });

    it('should contain relation mappings to role model', function(done) {
        expect(RoleModel.relationMappings).to.be.an.object();
        expect(RoleModel.relationMappings.users).to.exist();
        done();
    });
});
