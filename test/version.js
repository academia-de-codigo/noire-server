'use strict';

var Code = require('code'); // the assertions library
var Lab = require('lab'); // the test framework
var Server = require('../lib/server');
var Package = require('../package.json');

var lab = exports.lab = Lab.script(); // export the test script

// make lab feel like jasmine
var describe = lab.experiment;
var it = lab.test;
var expect = Code.expect;

describe('version plugin', function() {
    it('returns the version from package.json', function(done) {
        Server.init(0, function(err, server) {

            expect(err).to.not.exist();

            server.inject('/version', function(response) {

                expect(response.statusCode).to.equal(200);
                expect(response.result).to.equal({
                    version: Package.version
                });

                server.stop(done); // done() callback is required to end the test.

            });

        });
    });
});
