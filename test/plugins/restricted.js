'use strict';

var Code = require('code'); // the assertions library
var Lab = require('lab'); // the test framework
var Path = require('path');
var Server = require('../../lib/server');
var Config = require('../../lib/config');

var lab = exports.lab = Lab.script(); // export the test script

// make lab feel like jasmine
var describe = lab.experiment;
var it = lab.test;
var expect = Code.expect;

var internals = {};
internals.manifest = {
    connections: [{
        port: 0
    }],
    registrations: [{
        plugin: './plugins/auth'
    }, {
        plugin: './plugins/restricted'
    }]
};

internals.composeOptions = {
    relativeTo: Path.resolve(__dirname, '../../lib')
};

describe('Plugin: restricted', function() {

    it('returns the admin page', function(done) {

        Server.init(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exist();
            server.inject({
                method: 'GET',
                url: Config.prefixes.admin,
                credentials: {
                    scope: 'admin'
                },
            }, function(response) {

                expect(response.statusCode).to.equal(200);
                expect(response.result).to.be.a.string();
            });

            server.stop(done);
        });
    });

    it('returns the user account page', function(done) {

        Server.init(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exist();
            server.inject({
                method: 'GET',
                url: Config.prefixes.account,
                credentials: {
                    scope: 'user'
                },
            }, function(response) {

                expect(response.statusCode).to.equal(200);
                expect(response.result).to.be.a.string();
            });

            server.stop(done);
        });
    });
});
