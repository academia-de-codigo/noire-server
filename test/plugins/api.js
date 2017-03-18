'use strict';

var Code = require('code'); // the assertions library
var Lab = require('lab'); // the test framework
var Sinon = require('sinon');
var Exiting = require('exiting');
var Manager = require('../../lib/manager');
var Package = require('../../package.json');
var Path = require('path');
var Config = require('../../lib/config');
var LoginCtrl = require('../../lib/controllers/api/login');

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

    var loginCtrlStub, logoutCtrlStub;

    before(function(done) {

        // created using npm run token
        internals.token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MCwiaWF0IjoxNDc5MDQzNjE2fQ.IUXsKd8zaA1Npsh3P-WST5IGa-w0TsVMKh28ONkWqr8';

        loginCtrlStub = Sinon.stub(LoginCtrl, 'login').callsFake(function(request, reply) {
            return reply(internals.user);
        });

        logoutCtrlStub = Sinon.stub(LoginCtrl, 'logout').callsFake(function(request, reply) {
            return reply(internals.logout);
        });

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

    it('authenticates user credentials', function(done) {

        Manager.start(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exist();

            server.inject({
                method: 'POST',
                url: Config.prefixes.login,
                payload: {
                    username: 'test',
                    password: 'password'
                }
            }, function(response) {

                expect(LoginCtrl.login.calledOnce).to.be.true();
                expect(response.statusCode).to.equal(200);
                expect(response.result).to.equal(internals.user);
                loginCtrlStub.restore();
                Manager.stop(done);
            });
        });
    });

    it('destroys authenticated session', function(done) {

        Manager.start(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exist();

            server.inject(Config.prefixes.logout, function(response) {

                expect(LoginCtrl.logout.calledOnce).to.be.true();
                expect(response.statusCode).to.equal(200);
                expect(response.result).to.equal(internals.logout);

                logoutCtrlStub.restore();
                Manager.stop(done);
            });
        });
    });
});
