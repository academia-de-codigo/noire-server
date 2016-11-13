'use strict';

var Mockery = require('mockery'); // mock global node require
var Promise = require('bluebird');
var Code = require('code'); // the assertions library
var Lab = require('lab'); // the test framework
var MockUserService = require('../fixtures/user-service');
var HSError = require('../../lib/error');

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
    'email': 'test@gmail.com'
}, {
    'id': 1,
    'username': 'admin',
    'email': 'admin@gmail.com'
}];

describe('Controller: user', function() {

    var UserCtrl;

    before(function(done) {

        Mockery.enable({
            warnOnReplace: false,
            warnOnUnregistered: false
        });

        Mockery.registerMock('../services/user', MockUserService);
        MockUserService.setUsers(internals.users);
        UserCtrl = require('../../lib/controllers/user');

        done();

    });

    it('lists available users', function(done) {

        var request = {
            log: function() {}
        };

        UserCtrl.list(request, function(response) {

            expect(response).to.equals(internals.users);
            done();
        });
    });


    it('gets a specific user', function(done) {

        var request = {
            params: {
                id: 0
            },
            log: function() {}
        };

        UserCtrl.get(request, function(response) {

            expect(response).to.equals(internals.users[0]);
            done();
        });
    });

    it('handles get of a non existing user', function(done) {

        var request = {
            params: {
                id: 2
            },
            log: function() {}
        };

        UserCtrl.get(request, function(response) {

            expect(response.isBoom).to.be.true();
            expect(response.output.statusCode).to.equals(404);
            expect(response.output.payload.error).to.equals('Not Found');
            expect(response.output.payload.message).to.equals(HSError.RESOURCE_NOT_FOUND);
            done();
        });
    });

    it('handles server errors while listing users', {
        parallel: false
    }, function(done) {

        var ERROR = 'internal error';
        var origList = MockUserService.list;
        var origGet = MockUserService.get;

        MockUserService.list = MockUserService.get = function() {
            return Promise.resolve().then(function() {
                throw ERROR;
            });
        };

        var request = {
            params: {
                id: 0
            },
            log: function() {}
        };

        UserCtrl.list(request, function(response) {

            expect(response.isBoom).to.be.true();
            expect(response.output.statusCode).to.equals(500);
            expect(response.output.payload.error).to.equals('Internal Server Error');
            expect(response.output.payload.message).to.equals('An internal server error occurred');

            MockUserService.list = origList;
            MockUserService.get = origGet;

            done();
        });

    });

});
