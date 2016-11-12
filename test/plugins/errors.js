'use strict';

var Mockery = require('mockery'); // mock global node require
var Code = require('code'); // the assertions library
var Lab = require('lab'); // the test framework
var Path = require('path');
var Exiting = require('exiting');
var Manager = require('../../lib/manager');
var Config = require('../../lib/config');
var MockUserService = require('../fixtures/user-service');

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
        plugin: './plugins/login'
    }, {
        plugin: './plugins/errors'
    }, {
        plugin: './plugins/routes'
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

describe('Plugin: errors', function() {

    before(function(done) {

        Mockery.enable({
            warnOnReplace: false,
            warnOnUnregistered: false
        });

        Mockery.registerMock('../services/user', MockUserService);

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
                url: Config.paths.login,
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

        Manager.start(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exist();
            server.inject({
                method: 'POST',
                url: Config.paths.login,
                payload: {
                    email: 'test@gmail.com',
                    password: 'invalid'
                }
            }, function(response) {

                expect(response.statusCode).to.equal(401);
                expect(response.statusMessage).to.equal('Unauthorized');
                Manager.stop(done); // done() callback is required to end the test.
            });

        });

    });

    it('valid route with no errors', function(done) {

        Manager.start(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exist();
            server.inject(Config.paths.login, function(response) {

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

});
