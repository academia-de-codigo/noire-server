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

    it('adds a new user', function(done) {

        var request = {
            payload: {
                username: 'test2',
                email: 'test2@gmail.com',
                name: 'test2',
                password: 'test2'
            },
            log: function() {}
        };

        var fakeResponseData = {
            id: 1,
            username: request.payload.username,
            email: request.payload.email,
            password: request.payload.email
        };

        var addStub = Sinon.stub(UserService, 'add');
        addStub.withArgs(request.payload).returns(Promise.resolve(fakeResponseData));

        UserCtrl.create(request, function(response) {

            expect(addStub.calledOnce).to.be.true();
            expect(response).to.exists();
            expect(response.id).to.exists();
            expect(response.username).to.equals(fakeResponseData.username);
            expect(response.email).to.equals(fakeResponseData.email);
            expect(response.password).to.not.exists();

            return {
                created: function(location) {

                    expect(location).to.equals('/user/' + response.id);
                    addStub.restore();
                    done();
                }
            };
        });
    });

    it('handles server errors while adding a new user', function(done) {

        var request = {
            payload: {},
            log: function() {}
        };

        var addStub = Sinon.stub(UserService, 'add').returns(Promise.reject(HSError.RESOURCE_DUPLICATE));
        UserCtrl.create(request, function(response) {

            expect(UserService.add.calledOnce).to.be.true();
            expect(response.isBoom).to.be.true();
            expect(response.output.statusCode).to.equals(409);
            expect(response.output.payload.error).to.equals('Conflict');
            expect(response.output.payload.message).to.equals('resource already exists');

            addStub.restore();
            done();
        });
    });

    it('updates a user', function(done) {

        var request = {
            params: {
                id: 2
            },
            payload: {
                username: 'updatedUser'
            },
            log: function() {}
        };

        var updateStub = Sinon.stub(UserService, 'update');
        updateStub.withArgs(request.params.id, request.payload).returns(Promise.resolve({
            id: request.params.id,
            name: request.payload.name
        }));

        UserCtrl.update(request, function(response) {

            expect(UserService.update.calledOnce).to.be.true();
            expect(response.id).to.equals(request.params.id);
            expect(response.name).to.equals(request.payload.name);

            updateStub.restore();
            done();
        });
    });

    it('updates a user that does not exit', function(done) {

        var request = {
            params: {
                id: 2
            },
            payload: {
                username: 'updatedUser'
            },
            log: function() {}
        };

        var updateStub = Sinon.stub(UserService, 'update');
        updateStub.withArgs(request.params.id, request.payload).returns(Promise.reject(HSError.RESOURCE_NOT_FOUND));

        UserCtrl.update(request, function(response) {

            expect(UserService.update.calledOnce).to.be.true();
            expect(response.isBoom).to.be.true();
            expect(response.output.statusCode).to.equals(404);
            expect(response.output.payload.error).to.equals('Not Found');
            expect(response.output.payload.message).to.equals(HSError.RESOURCE_NOT_FOUND);

            updateStub.restore();
            done();
        });
    });

    it('updates a user when a duplicate exists', function(done) {

        var request = {
            params: {
                id: 2
            },
            payload: {
                username: 'updatedUser'
            },
            log: function() {}
        };

        var updateStub = Sinon.stub(UserService, 'update');
        updateStub.withArgs(request.params.id, request.payload).returns(Promise.reject(HSError.RESOURCE_DUPLICATE));

        UserCtrl.update(request, function(response) {

            expect(UserService.update.calledOnce).to.be.true();
            expect(response.isBoom).to.be.true();
            expect(response.output.statusCode).to.equals(409);
            expect(response.output.payload.error).to.equals('Conflict');
            expect(response.output.payload.message).to.equals(HSError.RESOURCE_DUPLICATE);

            updateStub.restore();
            done();
        });
    });

    it('handles server errors while updating user', function(done) {

        var request = {
            params: {
                id: 2
            },
            payload: {
                username: 'updatedUser'
            },
            log: function() {}
        };

        var updateStub = Sinon.stub(UserService, 'update');
        updateStub.withArgs(request.params.id, request.payload).returns(Promise.reject(HSError.RESOURCE_UPDATE));

        UserCtrl.update(request, function(response) {

            expect(UserService.update.calledOnce).to.be.true();
            expect(response.isBoom).to.be.true();
            expect(response.output.statusCode).to.equals(500);
            expect(response.output.payload.error).to.equals('Internal Server Error');
            expect(response.output.payload.message).to.equals('An internal server error occurred');

            updateStub.restore();
            done();
        });
    });
});
