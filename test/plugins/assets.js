var Code = require('code'); // the assertions library
var Lab = require('lab'); // the test framework
var Manager = require('../../lib/manager');
var Assets = require('../../lib/plugins/assets');
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
                relativeTo: Path.join(__dirname, '../../client/dist')
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

    it('returns the favicon', function(done) {

        Manager.start(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exist();

            server.inject('/favicon.ico', function(response) {

                expect(response.statusCode).to.equal(200);
                expect(response.result).to.be.a.string();
            });

            Manager.stop(done);
        });
    });

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

    it('returns commons css', function(done) {

        Manager.start(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exist();

            server.inject('/css/commons.css', function(response) {

                expect(response.statusCode).to.equal(200);
                expect(response.result).to.be.a.string();
            });

            Manager.stop(done);
        });
    });

    it('returns the commons js', function(done) {

        Manager.start(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exist();

            server.inject('/js/commons.bundle.js', function(response) {

                expect(response.statusCode).to.equal(200);
                expect(response.result).to.be.a.string();
            });

            Manager.stop(done);
        });
    });

    it('returns the app fonts', function(done) {

        Manager.start(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exist();

            server.inject('/fonts/OpenSans.woff2', function(response) {

                expect(response.statusCode).to.equal(200);
                expect(response.result).to.be.a.string();
            });

            Manager.stop(done);
        });
    });

    it('handles inert plugin registration failures', function(done) {
        var PLUGIN_ERROR = 'plugin error';
        var fakeServer = {
            dependency: function() {}
        };

        fakeServer.register = function(plugin, next) {
            return next(new Error(PLUGIN_ERROR));
        };

        Assets.register(fakeServer, null, function(error) {

            expect(error).to.exist();
            expect(error.message).to.equals(PLUGIN_ERROR);
            done();
        });
    });

});
