'use strict';

var Code = require('code'); // the assertions library
var Lab = require('lab'); // the test framework
var Path = require('path');
var Manager = require('../../lib/manager');
var Config = require('../../lib/config');
var Csrf = require('../../lib/plugins/csrf');

var lab = exports.lab = Lab.script(); // export the test script

// make lab feel like jasmine
var describe = lab.experiment;
var it = lab.test;
var expect = Code.expect;

var internals = {};
internals.manifest = {
    connections: [{
        host: 'localhost',
        port: 0,
    }],
    registrations: [{
        plugin: './plugins/login'
    }, {
        plugin: './plugins/csrf'
    }]
};

internals.user = {
    'id': 0,
    'email': 'test@gmail.com',
    'password': 'test'
};

internals.composeOptions = {
    relativeTo: Path.resolve(__dirname, '../../lib')
};

describe('Plugin: csrf', function() {

    it('handle crumb plugin registration failure', function(done) {

        var PLUGIN_ERROR = 'plugin error';
        var fakeManager = {};

        fakeManager.register = function(plugin, next) {
            return next(new Error(PLUGIN_ERROR));
        };

        Csrf.register(fakeManager, null, function(error) {

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
                url: Config.paths.login,
                payload: {
                    email: internals.user.email,
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

        Manager.start(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exists();

            server.inject('/generate', function(response) {

                var crumb = JSON.parse(response.payload).crumb;
                server.inject({
                    method: 'POST',
                    url: Config.paths.login,
                    payload: {
                        email: internals.user.email,
                        password: internals.user.password
                    },
                    headers: {
                        'x-csrf-token': crumb,
                        cookie: 'crumb=' + crumb
                    }
                }, function(response) {

                    expect(response.statusCode).to.equals(200);
                    Manager.stop(done);
                });

            });

        });
    });

});
