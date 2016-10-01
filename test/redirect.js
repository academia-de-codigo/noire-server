'use strict';

var Code = require('code'); // the assertions library
var Lab = require('lab'); // the test framework
var Path = require('path');
var Url = require('url');
var Server = require('../lib/server');
var Config = require('../lib/config');

var lab = exports.lab = Lab.script(); // export the test script

// make lab feel like jasmine
var describe = lab.experiment;
var it = lab.test;
var expect = Code.expect;

var internals = {
    adminUrl: {
        protocol: 'https',
        slashes: true,
        hostname: Config.servers.admin.host,
        port: Config.servers.admin.port
    },
    apiUrl: {
        protocol: 'https',
        slashes: true,
        hostname: Config.servers.api.host,
        port: Config.servers.api.port
    }
};

internals.manifest = {
    connections: [
        {
            host: 'localhost',
            port: 0,
            labels: ['web']
        },
        {
            host: 'localhost',
            port: 0,
            labels: ['admin'],
            tls: Config.tls
        },
        {
            host: 'localhost',
            port: 0,
            labels: ['api'],
            tls: Config.tls
        }
    ],
    registrations: [{
        plugin: './plugins/admin',
    }, {
        plugin: './plugins/redirect'
    }]
};

internals.composeOptions = {
    relativeTo: Path.resolve(__dirname, '../lib')
};


describe('Plugin: redirect', function() {

    it('redirects http api requests to https', function(done) {

        var redirectUrl = Url.format(internals.apiUrl) + Path.resolve(Config.servers.api.prefix, 'version');
        Server.init(internals.manifest, internals.composeOptions, function(err, server) {

            var web = server.select('web');
            expect(err).to.not.exist();
            web.inject('/api/version', function(response) {

                expect(response.statusCode).to.equal(301);
                expect(response.statusMessage).to.equal('Moved Permanently');
                expect(response.headers.location).to.equal(redirectUrl);
                server.stop(done); // done() callback is required to end the test.

            });

        });

    });

    it('redirects http admin requests to https', function(done) {

        var redirectUrl = Url.format(internals.adminUrl) + Path.resolve(Config.servers.admin.prefix);
        Server.init(internals.manifest, internals.composeOptions, function(err, server) {

            var web = server.select('web');
            expect(err).to.not.exist();
            web.inject('/admin', function(response) {

                expect(response.statusCode).to.equal(301);
                expect(response.statusMessage).to.equal('Moved Permanently');
                expect(response.headers.location).to.equal(redirectUrl);
                server.stop(done); // done() callback is required to end the test.

            });

        });

    });

});
