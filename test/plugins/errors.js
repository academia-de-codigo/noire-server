'use strict';

var Promise = require('bluebird'); // mock global node require
var Code = require('code'); // the assertions library
var Lab = require('lab'); // the test framework
var Sinon = require('sinon');
var Path = require('path');
var Exiting = require('exiting');
var Manager = require('../../lib/manager');
var Config = require('../../lib/config');
var UserService = require('../../lib/services/user');
var HSError = require('../../lib/error');

var lab = exports.lab = Lab.script(); // export the test script

// make lab feel like jasmine
var describe = lab.experiment;
var before = lab.before;
var afterEach = lab.afterEach;
var it = lab.test;
var expect = Code.expect;

var internals = {};
internals.manifest = {
    connections: [{
        host: 'localhost',
        port: 0,
    }],
    registrations: [{
        plugin: '../test/fixtures/auth-plugin'
    }, {
        plugin: './plugins/web-tls'
    }, {
        plugin: './plugins/errors'
    }, {
        plugin: './plugins/web'
    }, {
        plugin: './plugins/assets'
    }, {
        plugin: 'vision'
    }, {
        plugin: 'inert'
    }]
};

internals.composeOptions = {
    relativeTo: Path.resolve(__dirname, '../../lib')
};

internals.user = {
    'id': 0,
    'username': 'test',
    'email': 'test@gmail.com',
    'scope': 'user'
};

describe('Plugin: errors', function() {

    before(function(done) {

        Exiting.reset();
        done();
    });

    afterEach(function(done) {

        // Manager might not be properly stopped when tests fail
        if (Manager.getState() === 'started') {
            Manager.stop(done);
        } else {
            done();
        }

    });

    it('404 not found errors redirected to root', function(done) {

        Manager.start(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exist();
            server.inject('/invalid-route', function(response) {

                expect(response.statusCode).to.equal(301);
                expect(response.statusMessage).to.equal('Moved Permanently');
                expect(response.headers.location).to.equal(response.request.connection.info.uri);
                Manager.stop(done); // done() callback is required to end the test.
            });

        });

    });

    it('malformed data', function(done) {

        Manager.start(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exist();
            server.inject({
                method: 'POST',
                url: Config.prefixes.login,
                payload: {
                    email: 'invalid',
                    password: 'x'
                }
            }, function(response) {

                expect(response.statusCode).to.equal(400);
                expect(response.statusMessage).to.equal('Bad Request');
                expect(JSON.parse(response.payload).message).to.equal('Malformed Data Entered');
                Manager.stop(done); // done() callback is required to end the test.
            });

        });

    });

    it('insufficient scope', function(done) {

        Manager.start(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exist();
            server.inject({
                method: 'GET',
                url: Config.prefixes.admin,
                credentials: {
                    scope: 'user'
                },
            }, function(response) {

                expect(response.statusCode).to.equal(302);
                expect(response.statusMessage).to.equal('Found');
                expect(response.headers.location).to.equal(response.request.connection.info.uri);
                Manager.stop(done); // done() callback is required to end the test.
            });

        });
    });

    it('invalid password', function(done) {

        var mockUserData = {
            username: 'test',
            password: 'invalid'
        };

        var authenticateStub = Sinon.stub(UserService, 'authenticate');
        var promise = Promise.reject(HSError.AUTH_INVALID_PASSWORD);
        authenticateStub.withArgs(mockUserData.username, mockUserData.password).returns(promise);

        // for some reason i can not explain the auth plugin is not
        // catching this..
        promise.catch(function(err) {
            expect(err).to.equals(HSError.AUTH_INVALID_PASSWORD);
        });

        Manager.start(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exist();
            server.inject({
                method: 'POST',
                url: Config.prefixes.login,
                payload: {
                    username: mockUserData.username,
                    password: mockUserData.password
                }
            }, function(response) {

                expect(UserService.authenticate.calledOnce).to.be.true();
                expect(response.statusCode).to.equal(401);
                expect(response.statusMessage).to.equal('Unauthorized');
                authenticateStub.restore();
                Manager.stop(done); // done() callback is required to end the test.
            });

        });

    });

    it('valid route with no errors', function(done) {

        Manager.start(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exist();
            server.inject(Config.prefixes.login, function(response) {

                expect(response.statusCode).to.equal(200);
                expect(response.result).to.be.a.string();
                Manager.stop(done); // done() callback is required to end the test.
            });

        });
    });

    it('should not redirect assets', function(done) {

        Manager.start(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exist();
            server.inject('/img/invalid', function(response) {

                expect(response.statusCode).to.equal(404);
                expect(response.statusMessage).to.equal('Not Found');
                Manager.stop(done); // done() callback is required to end the test.
            });

        });
    });

    it('should not redirect on route errors with redirect set to false', function(done) {

        var path = '/somepath';
        Manager.start(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exist();
            server.route({
                method: 'GET',
                path: path,
                config: {
                    auth: {
                        scope: 'admin'
                    },
                    app: {
                        redirect: false
                    }
                },
                handler: function() {}
            });

            server.inject({
                method: 'GET',
                url: path,
                credentials: internals.user
            }, function(response) {

                expect(response.statusCode).to.equal(403);
                expect(response.statusMessage).to.equal('Forbidden');
                Manager.stop(done); // done() callback is required to end the test.
            });

        });
    });

});
