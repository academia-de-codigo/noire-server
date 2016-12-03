'use strict';
var Code = require('code'); // the assertions library
var Lab = require('lab'); // the test framework
var UserModel = require('../../lib/models/user');
var BaseModel = require('../../lib/models/base');

var lab = exports.lab = Lab.script(); // export the test script

// make lab feel like jasmine
var describe = lab.experiment;
var it = lab.test;
var expect = Code.expect;

describe('Model: user', function() {

    it('extends from base model', function(done) {

        var userModel = new UserModel();
        expect(userModel).to.be.an.instanceof(BaseModel);
        done();
    });

    it('should persist to a table named user', function(done) {
        expect(UserModel.tableName).to.equals('user');
        done();
    });

    it('should contain a schema', function(done) {
        expect(UserModel.jsonSchema).to.be.an.object();
        done();
    });

    it('should contain relation mappings to role model', function(done) {
        expect(UserModel.relationMappings).to.be.an.object();
        expect(UserModel.relationMappings.roles).to.exist();
        done();
    });
});
