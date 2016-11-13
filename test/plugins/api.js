'use strict';

var Mockery = require('mockery'); // mock global node require
var Code = require('code'); // the assertions library
var Lab = require('lab'); // the test framework
var Exiting = require('exiting');
var Manager = require('../../lib/manager');
var Package = require('../../package.json');
var Path = require('path');
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
        port: 0
    }],
    registrations: [{
        plugin: '../test/fixtures/auth-plugin'
    }, {
        plugin: './plugins/api'
    }]
};

internals.composeOptions = {
    relativeTo: Path.resolve(__dirname, '../../lib')
};

internals.user = {
    'id': 0,
    'username': 'test',
    'email': 'test@gmail.com',
    'roles': 'user'
};

internals.logout = {
    message: 'logout'
};

describe('Plugin: api', function() {

    var LoginCtrl;

    before(function(done) {

        Mockery.enable({
            warnOnReplace: false,
            warnOnUnregistered: false
        });

        Mockery.registerMock('../services/user', MockUserService);
        LoginCtrl = require('../../lib/controllers/login');

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

    it('returns the version from package.json', function(done) {

        Manager.start(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exist();

            server.inject('/version', function(response) {

                expect(response.statusCode).to.equal(200);
                expect(response.result).to.equal({
                    version: Package.version
                });

                Manager.stop(done); // done() callback is required to end the test.
            });

        });
    });

    it('authenticates user credentials', {
        paralell: false
    }, function(done) {

        var orig = LoginCtrl.login;
        LoginCtrl.login = function(request, reply) {

            return reply(internals.user);

        };

        Manager.start(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exist();

            server.inject({
                method: 'POST',
                url: Config.paths.login,
                payload: {
                    email: 'test@gmail.com',
                    password: 'password'
                }
            }, function(response) {

                LoginCtrl.login = orig;
                expect(response.statusCode).to.equal(200);
                expect(response.result).to.equal(internals.user);
                Manager.stop(done);
            });

        });
    });

    it('destroys authenticated session', {
        parallel: true
    }, function(done) {

        var orig = LoginCtrl.logout;
        LoginCtrl.logout = function(request, reply) {
            return reply(internals.logout);
        };

        Manager.start(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exist();

            server.inject(Config.paths.logout, function(response) {

                LoginCtrl.logout = orig;
                expect(response.statusCode).to.equal(200);
                expect(response.result).to.equal(internals.logout);
                Manager.stop(done);
            });

        });

    });

});
