'use strict';

var Code = require('code'); // the assertions library
var Lab = require('lab'); // the test framework
var Config = require('../../lib/config');
var Monitor = require('../../lib/plugins/monitor');

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
        plugin: './plugins/monitor'
    }]
};

describe('Plugin: monitor', function() {

    it('handle good plugin registration failure', function(done) {

        var PLUGIN_ERROR = 'plugin error';
        var fakeServer = {};
        fakeServer.on = function() {};

        fakeServer.register = function(plugin, next) {
            return next(new Error(PLUGIN_ERROR));
        };

        Monitor.register(fakeServer, null, function(error) {

            expect(error).to.exist();
            expect(error.message).to.equals(PLUGIN_ERROR);
            done();
        });
    });

    it('subscribes to route events', function(done) {

        var routeData = {
            realm: {
                plugin: 'test'
            },
            method: 'get',
            path: '/'
        };

        var fakeServer = {};
        fakeServer.on = function(event, next) {
            expect(event).to.match(/(route|request)/);
            expect(next).to.be.a.function();
            if(event === 'route') {
                next(routeData);
            }
        };

        fakeServer.log = function(tags, data) {
            expect(tags).to.be.an.array();
            expect(tags.indexOf('route')).not.to.equal(-1);
            expect(data.plugin).to.equals(routeData.realm.plugin);
            expect(data.method).to.equals(routeData.method);
            expect(data.path).to.equals(routeData.path);
        };

        fakeServer.register = function(plugin, next) {
            return next();
        };

        Monitor.register(fakeServer, null, function(error) {

            expect(error).to.not.exist();
            done();
        });
    });

    it('subscribes to request events', function(done) {

        var REQ_ID = 'XPTO';

        var requestData = {
            url: {
                path: '/'
            },
            info: {
                remoteAddress: '127.0.0.1'
            },
            headers: {}
        };
        requestData.headers['x-forwarded-for'] = requestData.info.remoteAddress;

        var eventData = {
            tags: ['someTag'],
            request: 'xxx:yyy:zzz:' + REQ_ID
        };

        var fakeServer = {};
        fakeServer.on = function(event, next) {
            expect(event).to.match(/(route|request)/);
            expect(next).to.be.a.function();
            if(event === 'request') {
                next(requestData, eventData);
            }
        };

        fakeServer.log = function(tags, data) {
            expect(tags).to.equals(eventData.tags);
            expect(data.id).to.equals(REQ_ID);
            expect(data.path).to.equals(requestData.url.path);
            expect(data.address).to.equals(requestData.info.remoteAddress);
        };

        fakeServer.register = function(plugin, next) {
            return next();
        };

        Monitor.register(fakeServer, null, function(error) {

            expect(error).to.not.exist();
            done();
        });
    });

    it('registers server log events to console reporter', {
        parallel: false // required as Config plugin is changed during execution
    }, function(done) {

        var origDebug = Config.monitor.debug;
        Config.monitor.debug = false;

        var fakeServer = {};
        fakeServer.on = function() {};
        fakeServer.register = function(plugin, next) {
            expect(plugin).to.exist();
            expect(plugin.options).to.be.an.object();
            expect(plugin.options.reporters).to.be.an.object();
            expect(plugin.options.reporters.console).to.be.an.array();
            expect(plugin.options.reporters.console[0].args).to.be.an.array();
            expect(plugin.options.reporters.console[0].args[0].response).to.not.exist();
            expect(plugin.options.reporters.console[0].args[0].route).to.not.exist();
            return next();
        };

        Monitor.register(fakeServer, null, function(error) {

            expect(error).to.not.exist();
            Config.monitor.debug = origDebug;
            done();
        });

    });

    it('registers route and response events to console reporter in debug', {
        parallel: false // required as Config plugin is changed during execution
    }, function(done) {

        var origDebug = Config.monitor.debug;
        Config.monitor.debug = true;

        var fakeServer = {};
        fakeServer.on = function() {};
        fakeServer.register = function(plugin, next) {
            expect(plugin).to.exist();
            expect(plugin.options).to.be.an.object();
            expect(plugin.options.reporters).to.be.an.object();
            expect(plugin.options.reporters.console).to.be.an.array();
            expect(plugin.options.reporters.console[0].args).to.be.an.array();
            expect(plugin.options.reporters.console[0].args[0].response).to.exist();
            expect(plugin.options.reporters.console[0].args[0].route).to.exist();
            return next();
        };

        Monitor.register(fakeServer, null, function(error) {

            expect(error).to.not.exist();
            Config.monitor.debug = origDebug;
            done();
        });

    });

});
