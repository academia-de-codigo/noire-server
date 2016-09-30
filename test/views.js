'use strict';

var Code = require('code'); // the assertions library
var Lab = require('lab'); // the test framework
var Server = require('../lib/server');
var Views = require('../lib/plugins/views');
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
        plugin: './plugins/views'
    }]
};

internals.composeOptions = {
    relativeTo: Path.resolve(__dirname, '../lib')
};

describe('Plugin: views', function() {

    it('handles vision plugin registration failure', {
        parallel: false
    }, function(done) {

        var PLUGIN_ERROR = 'plugin error';
        var fakeServer = {};

        fakeServer.register = function(plugin, next) {
            return next(new Error(PLUGIN_ERROR));
        };

        Views.register(fakeServer, null, function(error) {

            expect(error).to.exist();
            expect(error.message).to.equals(PLUGIN_ERROR);
            done();

        });

    });

    it('returns the home view', function(done) {

        Server.init(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exist();

            server.inject('/home', function(response) {

                expect(response.statusCode).to.equal(200);
                expect(response.result).to.be.a.string();
            });

            server.stop(done);
        });
    });

});
