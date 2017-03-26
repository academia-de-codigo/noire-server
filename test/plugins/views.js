var Code = require('code'); // the assertions library
var Lab = require('lab'); // the test framework
var Path = require('path');
var Views = require('../../lib/plugins/views');

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
