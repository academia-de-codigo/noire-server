'use strict';

var Code = require('code'); // the assertions library
var Lab = require('lab'); // the test framework
var Sinon = require('sinon');
var Promise = require('bluebird');
var Path = require('path');
var Exiting = require('exiting');
var Manager = require('../../lib/manager');
var Config = require('../../lib/config');
var Csrf = require('../../lib/plugins/csrf');
var UserService = require('../../lib/services/user');

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
        plugin: './plugins/web-tls'
    }, {
        plugin: './plugins/csrf'
    }]
};

internals.user = {
    'id': 0,
    'username': 'test',
    'email': 'test@gmail.com',
    'password': 'test'
};

internals.composeOptions = {
    relativeTo: Path.resolve(__dirname, '../../lib')
};

describe('Plugin: csrf', function() {

    before(function(done) {

        // created using npm run token
        internals.token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MCwiaWF0IjoxNDc5MDQzNjE2fQ.IUXsKd8zaA1Npsh3P-WST5IGa-w0TsVMKh28ONkWqr8';

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

    it('handle crumb plugin registration failure', function(done) {

        var PLUGIN_ERROR = 'plugin error';
        var fakeServer = {};

        fakeServer.register = function(plugin, next) {
            return next(new Error(PLUGIN_ERROR));
        };

        Csrf.register(fakeServer, null, function(error) {

            expect(error).to.exist();
            expect(error.message).to.equals(PLUGIN_ERROR);
            done();
        });
    });

    it('returns valid crumb', function(done) {

        Manager.start(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exists();

            server.inject('/generate', function(response) {

                expect(response.statusCode).to.equals(200);
                expect(response.payload).to.be.a.string();
                expect(JSON.parse(response.payload)).to.be.an.object();
                expect(JSON.parse(response.payload).crumb).to.be.a.string();
                Manager.stop(done);

            });
        });

    });

    it('errors on missing crumb headers', function(done) {

        Manager.start(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exists();

            server.inject({
                method: 'POST',
                url: Config.prefixes.login,
                payload: {
                    username: internals.user.username,
                    password: internals.user.password
                }
            }, function(response) {

                expect(response.statusCode).to.equals(403);
                expect(response.statusMessage).to.equals('Forbidden');
                Manager.stop(done);

            });
        });
    });

    it('success if crumb headers present', function(done) {

        var authenticateStub = Sinon.stub(UserService, 'authenticate');
        authenticateStub.withArgs(internals.user.username, internals.user.password).returns(Promise.resolve(internals.token));

        Manager.start(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exists();

            server.inject('/generate', function(response) {

                var crumb = JSON.parse(response.payload).crumb;
                server.inject({
                    method: 'POST',
                    url: Config.prefixes.login,
                    payload: {
                        username: internals.user.username,
                        password: internals.user.password
                    },
                    headers: {
                        'x-csrf-token': crumb,
                        cookie: 'crumb=' + crumb
                    }
                }, function(response) {

                    expect(UserService.authenticate.calledOnce).to.be.true();
                    expect(response.statusCode).to.equals(200);

                    authenticateStub.restore();
                    Manager.stop(done);
                });

            });

        });
    });

});
