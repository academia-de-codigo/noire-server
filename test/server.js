'use strict';

var Code = require('code'); // the assertions library
var Lab = require('lab'); // the test framework
var Hapi = require('hapi');
var Http = require('http');
var Https = require('https');
var Server = require('../lib/server');
var Version = require('../lib/plugins/version');
var Config = require('../lib/config');
var Path = require('path');

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
        labels: ['web']
    }, {
        host: 'localhost',
        port: 0,
        labels: ['admin'],
        tls: Config.tls
    }, {
        host: 'localhost',
        port: 0,
        labels: ['api'],
        tls: Config.tls
    }],
    registrations: [{
        plugin: './plugins/version'
    }]
};

internals.composeOptions = {
    relativeTo: Path.resolve(__dirname, '../lib')
};

describe('Server bootstrap', function() {

    it('start server and return server object', function(done) {

        var manifest = {
            connections: [{
                port: 0
            }]
        };

        Server.init(manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exist();
            expect(server).to.be.instanceof(Hapi.Server);
            server.stop(done);
        });

    });

    it('start server on specified port', function(done) {

        var manifest = {
            connections: [{
                port: 8080
            }]
        };

        Server.init(manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exist();
            expect(server.info.port).to.equal(8080);

            server.stop(done);
        });
    });

    it('start server with multiple listeners', function(done) {

        Server.init(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exist();
            expect(server).to.be.instanceof(Hapi.Server);
            expect(server.connections.length).to.equal(3);
            expect(server.select('web').connections.length).to.equal(1);
            expect(server.select('admin').connections.length).to.equal(1);
            expect(server.select('api').connections.length).to.equal(1);

            server.stop(done);
        });

    });

    it('should use http for listener web', function(done) {

        Server.init(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exist();
            expect(server).to.be.instanceof(Hapi.Server);
            expect(server.select('web').listener instanceof Http.Server).to.equal(true);
            server.stop(done);
        });

    });

    it('should use https for listener admin', function(done) {

        Server.init(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exist();
            expect(server).to.be.instanceof(Hapi.Server);
            expect(server.select('admin').listener instanceof Https.Server).to.equal(true);
            server.stop(done);
        });

    });

    it('should use https for listener api', function(done) {

        Server.init(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exist();
            expect(server).to.be.instanceof(Hapi.Server);
            expect(server.select('api').listener instanceof Https.Server).to.equal(true);
            server.stop(done);
        });

    });

    it('handles register plugin errors', {
        parallel: false
    }, function(done) {

        var PLUGIN_ERROR = 'register plugin failed';

        // save the original version plugin register function, as we will
        // monkey patch it to test how server handles plugin registration errors
        var orig = Version.register;

        // crate a new fake version plugin register function
        // parallel testing is not safe with monkey patching like this
        Version.register = function(server, options, next) {

            // restore the original version plugin register function
            Version.register = orig;

            // force plugin registration to fail
            return next(new Error(PLUGIN_ERROR));

        };

        // registration function needs a version
        Version.register.attributes = {
            name: 'fake version'
        };

        Server.init(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.exist();
            expect(server).to.not.exist();
            expect(err.message).to.equal(PLUGIN_ERROR);

            done();
        });

    });

});
