var Code = require('code'); // the assertions library
var Lab = require('lab'); // the test framework
var Path = require('path');
var Views = require('../../lib/plugins/views');
var Manager = require('../../lib/manager');

var lab = exports.lab = Lab.script(); // export the test script

// make lab feel like jasmine
var describe = lab.experiment;
var it = lab.test;
var expect = Code.expect;

var internals = {};

internals.manifest = {
    connections: [{
        port: 0,
    }],
    registrations: [{
        plugin: './plugins/views'
    }]
};

internals.composeOptions = {
    relativeTo: Path.resolve(__dirname, '../../lib')
};

describe('Plugin: views', function() {

    it('registers the vision plugin', function(done) {

        var fakeServer = {
            dependency: function() {},
            ext: function() {},
            register: function(plugin, next) {
                expect(plugin).to.exists();
                expect(plugin.register).to.exists();
                expect(plugin.register.attributes).to.exists();
                expect(plugin.register.attributes.pkg).to.exists();
                expect(plugin.register.attributes.pkg.name).to.equals('vision');
                next();
            }
        };

        Views.register(fakeServer, null, function() {
            done();
        });
    });

    it('does not add logged in user to view context if not authenticated', function(done) {

        var credentials = 'test';

        Manager.start(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exist();

            server.views({
                engines: {
                    hbs: require('handlebars')
                },
                path: Path.join(__dirname,'/../fixtures'),
                isCached: false
            });

            server.route({
                method: 'GET',
                path: '/',
                handler: function(request, reply) {
                    request.auth.credentials = credentials;
                    return reply.view('template');
                }
            });

            server.inject('/', function(response) {

                expect(response.result).to.be.a.string();
                expect(response.result).to.not.equals(credentials);
                Manager.stop(done);
            });
        });
    });

    it('adds logged in user to view context if authenticated', function(done) {

        var credentials = 'test';

        Manager.start(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exist();

            server.views({
                engines: {
                    hbs: require('handlebars')
                },
                path: Path.join(__dirname,'/../fixtures'),
                isCached: false
            });

            server.route({
                method: 'GET',
                path: '/',
                handler: function(request, reply) {
                    request.auth.isAuthenticated = true;
                    request.auth.credentials = credentials;
                    return reply.view('template');
                }
            });

            server.inject('/', function(response) {

                expect(response.result).to.be.a.string();
                expect(response.result).to.startWith(credentials);
                Manager.stop(done);
            });
        });
    });

    it('handles vision plugin registration failures', function(done) {
        var PLUGIN_ERROR = 'plugin error';
        var fakeServer = {
            dependency: function() {}
        };

        fakeServer.register = function(plugin, next) {
            return next(new Error(PLUGIN_ERROR));
        };

        Views.register(fakeServer, null, function(error) {

            expect(error).to.exist();
            expect(error.message).to.equals(PLUGIN_ERROR);
            done();
        });
    });
});
