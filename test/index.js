'use strict';

var Code = require('code'); // the assertions library
var Lab = require('lab'); // the test framework
var Hapi = require('hapi');
var Server = require('../lib/server');
var Version = require('../lib/version');

var lab = exports.lab = Lab.script(); // export the test script

// make lab feel like jasmine
var describe = lab.experiment;
var it = lab.test;
var expect = Code.expect;

describe('server bootstrap', function() {

    it('start server and return server object', function(done) {

        Server.init(0, function(err, server) {

            expect(err).to.not.exist();
            expect(server).to.be.instanceof(Hapi.Server);

            server.stop(done);
        });

    });

    it('start server on specified port', function(done) {

        Server.init(8080, function(err, server) {

            expect(err).to.not.exist();
            expect(server.info.port).to.equal(8080);

            server.stop(done);
        });
    });

    it('handles register plugin errors', function(done) {

        var PLUGIN_ERROR = 'register version failed';

        // save the original version plugin register function
        var orig = Version.register;

        // crate a new fake version plugin register function
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

        Server.init(0, function(err, server) {

            expect(err).to.exist();
            expect(server).to.not.exist();
            expect(err.message).to.equal(PLUGIN_ERROR);

            done();
        });

    });

});
