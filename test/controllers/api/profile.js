var Promise = require('bluebird');
var Code = require('code'); // the assertions library
var Lab = require('lab'); // the test framework
var Sinon = require('sinon');
var UserService = require('../../../lib/services/user');
var ProfileCtrl = require('../../../lib/controllers/api/profile');
var HSError = require('../../../lib/error');

var lab = exports.lab = Lab.script(); // export the test script

// make lab feel like jasmine
var describe = lab.experiment;
var it = lab.test;
var expect = Code.expect;

var internals = {};
internals.user = {
    'id': 0,
    'username': 'test',
    'email': 'test@gmail.com'
};

describe('API Controller: Profile', function() {

    it('gets the user profile', function(done) {

        var request = {
            auth: {
                credentials: {
                    id: 0
                }
            },
            log: function() {}
        };

        var findByIdStub = Sinon.stub(UserService, 'findById');
        findByIdStub.withArgs(request.auth.credentials.id).returns(Promise.resolve(internals.user));

        ProfileCtrl.get(request, function(response) {

            expect(UserService.findById.calledOnce).to.be.true();
            expect(response).to.equals(internals.user);

            findByIdStub.restore();
            done();
        });
    });

    it('handles get of a non existing user profile', function(done) {

        var request = {
            auth: {
                credentials: {
                    id: 0
                }
            },
            log: function() {}
        };

        var findByIdStub = Sinon.stub(UserService, 'findById');
        findByIdStub.withArgs(request.auth.credentials.id).returns(Promise.reject(HSError.RESOURCE_NOT_FOUND));

        ProfileCtrl.get(request, function(response) {

            expect(UserService.findById.calledOnce).to.be.true();
            expect(response.isBoom).to.be.true();
            expect(response.output.statusCode).to.equals(404);
            expect(response.output.payload.error).to.equals('Not Found');
            expect(response.output.payload.message).to.equals(HSError.RESOURCE_NOT_FOUND);

            findByIdStub.restore();
            done();
        });
    });

    it('handles server errors while getting user profile', function(done) {

        var request = {
            auth: {
                credentials: {
                    id: 0
                }
            },
            log: function() {}
        };

        var findByIdStub = Sinon.stub(UserService, 'findById');
        findByIdStub.withArgs(request.auth.credentials.id).returns(Promise.reject(HSError.RESOURCE_FETCH));

        ProfileCtrl.get(request, function(response) {

            expect(UserService.findById.calledOnce).to.be.true();
            expect(response.isBoom).to.be.true();
            expect(response.output.statusCode).to.equals(500);
            expect(response.output.payload.error).to.equals('Internal Server Error');
            expect(response.output.payload.message).to.equals('An internal server error occurred');

            findByIdStub.restore();
            done();
        });
    });

    it('updates the user profile', function(done) {

        var request = {
            auth: {
                credentials: {
                    id: 0
                }
            },
            payload: {
                username: 'newusername'
            },
            log: function() {}
        };

        var updateStub = Sinon.stub(UserService, 'update');
        updateStub.withArgs(request.auth.credentials.id, request.payload).returns(Promise.resolve({
            id: request.auth.credentials.id,
            username: request.payload.username
        }));

        ProfileCtrl.update(request, function(response) {

            expect(UserService.update.calledOnce).to.be.true();
            expect(response.id).to.equals(request.auth.credentials.id);
            expect(response.username).to.equals(request.payload.username);

            updateStub.restore();
            done();
        });
    });

    it('handles server errors while updating user profile', function(done) {

        var request = {
            auth: {
                credentials: {
                    id: 0
                }
            },
            log: function() {}
        };

        var updateStub = Sinon.stub(UserService, 'update');
        updateStub.withArgs(request.auth.credentials.id, request.payload).returns(Promise.reject(HSError.RESOURCE_UPDATE));

        ProfileCtrl.update(request, function(response) {

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
