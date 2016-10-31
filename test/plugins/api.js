'use strict';

var Code = require('code'); // the assertions library
var Lab = require('lab'); // the test framework
var Manager = require('../../lib/manager');
var Package = require('../../package.json');
var Path = require('path');

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
        plugin: './plugins/api'
    }]
};

internals.composeOptions = {
    relativeTo: Path.resolve(__dirname, '../../lib')
};

describe('Plugin: api', function() {

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
});