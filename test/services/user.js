'use strict';

var Code = require('code'); // the assertions library
var Lab = require('lab'); // the test framework
var UserService = require('../../lib/services/user');

var lab = exports.lab = Lab.script(); // export the test script

// make lab feel like jasmine
var describe = lab.experiment;
var before = lab.before;
var it = lab.test;
var expect = Code.expect;

var internals = {};
internals.users = [{
    'id': 0,
    'username': 'test',
    'email': 'test@gmail.com',
    'password': 'test',
    'roles': 'user'
}, {
    'id': 1,
    'username': 'admin',
    'email': 'admin@gmail.com',
    'password': 'admin',
    'roles': ['user', 'admin']
}];

describe('Service: user', function() {

    before(function(done) {
        UserService.setUsers(internals.users);
        done();
    });

    it('fetch valid user by id', function(done) {

        expect(UserService.getById(0)).to.equals(internals.users[0]);
        expect(UserService.getById(1)).to.equals(internals.users[1]);
        done();

    });

    it('fetch invalid user by id', function(done) {

        expect(UserService.getById(-1)).to.not.exist();
        done();

    });

    it('fetch valid user by email', function(done) {

        expect(UserService.getByEmail('test@gmail.com')).to.equals(internals.users[0]);
        expect(UserService.getByEmail('admin@gmail.com')).to.equals(internals.users[1]);
        done();

    });

    it('fetch invalid user by email', function(done) {

        expect(UserService.getByEmail('invalid')).to.not.exist();
        done();

    });

});
