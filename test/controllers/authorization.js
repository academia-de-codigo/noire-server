var Promise = require('bluebird');
var Code = require('code'); // the assertions library
var Lab = require('lab'); // the test framework
var Sinon = require('sinon');
var AuthorizationController = require('../../lib/controllers/authorization');
var AuthorizationService = require('../../lib/services/authorization');

var lab = exports.lab = Lab.script(); // export the test script

// make lab feel like jasmine
var describe = lab.experiment;
var it = lab.test;
var expect = Code.expect;

var internals = {
    action: 'read',
    resource: 'role'
};

internals.request = {
    auth: {
        credentials: {
            username: 'username'
        }
    },
    method: 'get',
    log: function() {}
};

describe('Controller: Authorization', function() {

    it('authorizes user to access resource', function(done) {

        var canUser = Sinon.stub(AuthorizationService, 'canUser');
        canUser.withArgs(internals.request.auth.credentials.username, internals.action, internals.resource).returns(Promise.resolve(true));

        var authHandler = AuthorizationController.authorize(internals.resource, internals.action);
        authHandler(internals.request, function(response) {

            expect(response).to.not.exists();
            canUser.restore();
            done();
        });
    });

    it('does not authorize user to access resource', function(done) {

        var canUser = Sinon.stub(AuthorizationService, 'canUser');
        canUser.withArgs(internals.request.auth.credentials.username, internals.action, internals.resource).returns(Promise.resolve(false));

        var authHandler = AuthorizationController.authorize(internals.resource, internals.action);
        authHandler(internals.request, function(response) {

            expect(response.isBoom).to.be.true();
            expect(response.output.statusCode).to.equals(403);
            expect(response.output.payload.error).to.equals('Forbidden');
            expect(response.output.payload.message).to.equals('insufficient privileges');

            canUser.restore();
            done();
        });
    });

    it('handles errors while authorizing', function(done) {

        var canUser = Sinon.stub(AuthorizationService, 'canUser');
        canUser.withArgs(internals.request.auth.credentials.username, internals.action, internals.resource).returns(Promise.reject('error'));

        var authHandler = AuthorizationController.authorize(internals.resource, internals.action);
        authHandler(internals.request, function(response) {

            expect(response.isBoom).to.be.true();
            expect(response.output.statusCode).to.equals(500);
            expect(response.output.payload.error).to.equals('Internal Server Error');
            expect(response.output.payload.message).to.equals('An internal server error occurred');

            canUser.restore();
            done();
        });

    });
});
