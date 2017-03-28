var Code = require('code'); // the assertions library
var Lab = require('lab'); // the test framework
var Path = require('path');
var Exiting = require('exiting');
var Manager = require('../../lib/manager');
var Docs = require('../../lib/plugins/docs');

var lab = exports.lab = Lab.script(); // export the test script

// make lab feel like jasmine
var describe = lab.experiment;
var before = lab.before;
var afterEach = lab.afterEach;
var it = lab.test;
var expect = Code.expect;

var internals = {};

internals.manifest = {
    connections: [{
        port: 0,
    }],
    registrations: [{
        plugin: 'inert'
    }, {
        plugin: './plugins/views'
    }, {
        plugin: './plugins/docs'
    }]
};

internals.composeOptions = {
    relativeTo: Path.resolve(__dirname, '../../lib')
};

describe('Plugin: docs', function() {

    before(function(done) {

        Exiting.reset();
        done();
    });

    afterEach(function(done) {

        // Manager might not be properly stopped when tests fail
        if (Manager.getState() === 'started') {
            Manager.stop(done);
        } else {
            done();
        }
    });

    it('depends on views plugin', function(done) {

        var fakeServer = {
            dependency: function(plugin) {
                expect(plugin).to.equals('views');
            },
            register: function(options, next) {
                next();
            }
        };

        Docs.register(fakeServer, null, function() {
            done();
        });
    });

    it('registers the lout plugin', function(done) {

        var fakeServer = {
            dependency: function() {},
            register: function(options, next) {
                expect(options.register).to.exists();
                expect(options.register.register).to.exists();
                expect(options.register.register.attributes).to.exists();
                expect(options.register.register.attributes.pkg).to.exists();
                expect(options.register.register.attributes.pkg.name).to.equals('lout');
                next();
            }
        };

        Docs.register(fakeServer, null, function() {
            done();
        });

    });

    it('handle lout plugin registration failures', function(done) {
        var PLUGIN_ERROR = 'plugin error';
        var fakeServer = {
            dependency: function() {}
        };

        fakeServer.register = function(plugin, next) {
            return next(new Error(PLUGIN_ERROR));
        };

        Docs.register(fakeServer, null, function(error) {

            expect(error).to.exist();
            expect(error.message).to.equals(PLUGIN_ERROR);
            done();
        });
    });

    it('returns the docs view', function(done) {

        Manager.start(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exist();

            // lout does not work if the server routing table is empty
            server.route({
                path: '/',
                method: 'GET',
                config: {
                    auth: false,
                    handler: function(request, reply) {
                        return reply();
                    }
                }
            });

            server.inject('/docs', function(response) {

                expect(response.statusCode).to.equal(200);
                expect(response.result).to.be.a.string();
                Manager.stop(done);

            });
        });
    });
});
