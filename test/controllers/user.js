'use strict';

var Promise = require('bluebird');
var Code = require('code'); // the assertions library
var Lab = require('lab'); // the test framework
var Sinon = require('sinon');
var UserService = require('../../lib/services/user');
var UserCtrl = require('../../lib/controllers/user');
var HSError = require('../../lib/error');

var lab = exports.lab = Lab.script(); // export the test script

// make lab feel like jasmine
var describe = lab.experiment;
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

    it('lists available users', function(done) {

        var request = {
            log: function() {}
        };

        var listStub = Sinon.stub(UserService, 'list');
        listStub.returns(Promise.resolve(internals.users));

        UserCtrl.list(request, function(response) {

            expect(UserService.list.calledOnce).to.be.true();
            expect(response).to.equals(internals.users);

            listStub.restore();
            done();
        });
    });

    it('handles server errors while listing users', function(done) {

        var request = {
            log: function() {}
        };

        var listStub = Sinon.stub(UserService, 'list');
        listStub.returns(Promise.reject(HSError.RESOURCE_FETCH));

        UserCtrl.list(request, function(response) {

            expect(UserService.list.calledOnce).to.be.true();
            expect(response.isBoom).to.be.true();
            expect(response.output.statusCode).to.equals(500);
            expect(response.output.payload.error).to.equals('Internal Server Error');
            expect(response.output.payload.message).to.equals('An internal server error occurred');

            listStub.restore();
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

        var findByIdStub = Sinon.stub(UserService, 'findById');
        findByIdStub.withArgs(request.params.id).returns(Promise.resolve(internals.users[request.params.id]));

        UserCtrl.get(request, function(response) {

            expect(UserService.findById.calledOnce).to.be.true();
            expect(response).to.equals(internals.users[request.params.id]);

            findByIdStub.restore();
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

        var findByIdStub = Sinon.stub(UserService, 'findById');
        findByIdStub.withArgs(request.params.id).returns(Promise.reject(HSError.RESOURCE_NOT_FOUND));

        UserCtrl.get(request, function(response) {

            expect(UserService.findById.calledOnce).to.be.true();
            expect(response.isBoom).to.be.true();
            expect(response.output.statusCode).to.equals(404);
            expect(response.output.payload.error).to.equals('Not Found');
            expect(response.output.payload.message).to.equals(HSError.RESOURCE_NOT_FOUND);

            findByIdStub.restore();
            done();
        });
    });

    it('handles server errors while getting a user', function(done) {

        var request = {
            params: {
                id: 0
            },
            log: function() {}
        };

        var findByIdStub = Sinon.stub(UserService, 'findById');
        findByIdStub.withArgs(request.params.id).returns(Promise.reject(HSError.RESOURCE_FETCH));

        UserCtrl.get(request, function(response) {

            expect(UserService.findById.calledOnce).to.be.true();
            expect(response.isBoom).to.be.true();
            expect(response.output.statusCode).to.equals(500);
            expect(response.output.payload.error).to.equals('Internal Server Error');
            expect(response.output.payload.message).to.equals('An internal server error occurred');

            findByIdStub.restore();
            done();
        });
    });
});
