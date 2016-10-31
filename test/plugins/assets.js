'use strict';

var Code = require('code'); // the assertions library
var Lab = require('lab'); // the test framework
var Manager = require('../../lib/manager');
var Path = require('path');
var lab = exports.lab = Lab.script(); // export the test script

// make lab feel like jasmine
var describe = lab.experiment;
var it = lab.test;
var expect = Code.expect;

var internals = {};

internals.manifest = {
    connections: [{
        port: 0,
        routes: {
            files: {
                relativeTo: Path.join(__dirname, '../../assets')
            }
        }
    }],
    registrations: [{
        plugin: './plugins/assets'
    }, {
        plugin: 'inert'
    }]
};

internals.composeOptions = {
    relativeTo: Path.resolve(__dirname, '../../lib')
};

describe('Plugin: assets', function() {

    it('returns the app images', function(done) {

        Manager.start(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exist();

            server.inject('/img/low_contrast_linen.png', function(response) {

                expect(response.statusCode).to.equal(200);
                expect(response.result).to.be.a.string();
            });

            Manager.stop(done);
        });
    });

    it('returns the app css', function(done) {

        Manager.start(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exist();

            server.inject('/css/app.css', function(response) {

                expect(response.statusCode).to.equal(200);
                expect(response.result).to.be.a.string();
            });

            Manager.stop(done);
        });
    });

    it('returns the app js', function(done) {

        Manager.start(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exist();

            server.inject('/js/app.js', function(response) {

                expect(response.statusCode).to.equal(200);
                expect(response.result).to.be.a.string();
            });

            Manager.stop(done);
        });
    });

    it('returns the app fonts', function(done) {

        Manager.start(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exist();

            server.inject('/fonts/foundation-icons.ttf', function(response) {

                expect(response.statusCode).to.equal(200);
                expect(response.result).to.be.a.string();
            });

            Manager.stop(done);
        });
    });

});
