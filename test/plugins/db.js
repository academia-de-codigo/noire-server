'use strict';
var Mockery = require('mockery'); // mock global node require
var Code = require('code'); // the assertions library
var Lab = require('lab'); // the test framework
var Hapi = require('hapi');
var Path = require('path');
var Manager = require('../../lib/manager');

var lab = exports.lab = Lab.script(); // export the test script
var before = lab.before;
var after = lab.after;

// make lab feel like jasmine
var describe = lab.experiment;
var it = lab.test;
var expect = Code.expect;

var internals = {};
internals.manifest = {
    registrations: [{
        plugin: './plugins/db'
    }]
};

internals.composeOptions = {
    relativeTo: Path.resolve(__dirname, '../../lib')
};

describe('Plugin: db', function() {

    //TODO: Replace mockery with Sinon and get rid of this mocking mess..

    var mockConfig;
    var mockKnexConfig, mockKnex, mockObjection, mockKnexInstance;
    var dbTestResult = 2;
    var mockError = null;
    var ENV_DEV = 'development';
    var ENV_STAGING = 'staging';

    before(function(done) {

        Mockery.enable({
            warnOnReplace: false,
            warnOnUnregistered: false
        });

        mockConfig = {
            environment: ENV_DEV,
        };

        mockKnexConfig = {};
        mockKnexConfig[mockConfig.environment] = {
            debug: {}
        };

        mockKnexInstance = {
            raw: function(query) {
                expect(query).to.startWith('select');
                return {
                    then: function(next, nextErr) {

                        if (mockError) {
                            return nextErr({
                                message: mockError
                            });
                        }

                        var dbResponse;
                        if (mockConfig.environment === ENV_DEV) {
                            dbResponse = [{
                                result: dbTestResult
                            }];
                        } else {
                            dbResponse = {
                                rows: [{
                                    result: dbTestResult
                                }]
                            };
                        }
                        next(dbResponse);
                    }
                };
            },
            destroy: function(next) {
                next();
            }
        };

        mockKnex = function(config) {
            expect(config).to.equals(mockKnexConfig[mockConfig.environment]);
            return mockKnexInstance;
        };

        mockObjection = {
            Model: {
                knex: function() {}
            }
        };

        Mockery.registerMock('../config', mockConfig);
        Mockery.registerMock('../../knexfile', mockKnexConfig);
        Mockery.registerMock('knex', mockKnex);
        Mockery.registerMock('objection', mockObjection);
        done();
    });

    after(function(done) {

        Mockery.deregisterAll();
        Mockery.disable();
        done();
    });

    it('initializes the knex db library with sqlite', {
        parallel: false
    }, function(done) {

        mockConfig.environment = ENV_DEV;
        Manager.start(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exist();
            expect(server).to.be.instanceof(Hapi.Server);
            Manager.stop(done);
        });
    });

    it('initializes the knex db library with postgresql', {
        parallel: false
    }, function(done) {

        mockConfig.environment = ENV_STAGING;
        Manager.start(internals.manifest, internals.composeOptions, function(err, server) {

            mockConfig.environment = ENV_DEV;
            expect(err).to.not.exist();
            expect(server).to.be.instanceof(Hapi.Server);
            Manager.stop(done);
        });
    });

    it('handles db connection error', {
        parallel: false
    }, function(done) {

        var Db = require('../../lib/plugins/db'); // Have to require this after knex is mocked by mockery

        var fakeServer = {};
        fakeServer.log = function(tags, data) {
            expect(tags).to.contains('db');
            expect(tags).to.contains('error');
            expect(data).to.equals(mockError);
        };

        fakeServer.register = function(plugin, next) {
            return next();
        };

        mockConfig.environment = ENV_DEV;
        mockError = 'database pool connection error';
        Db.register(fakeServer, null, function(err) {

            mockError = null;
            expect(err).to.not.exist();
            done();
        });
    });

    it('handles db connection test unexpected result with sqlite', {
        parallel: false
    }, function(done) {

        var Db = require('../../lib/plugins/db'); // Have to require this after knex is mocked by mockery

        var fakeServer = {};
        fakeServer.log = function(tags, data) {
            expect(tags).to.contains('db');
            expect(tags).to.contains('error');
            expect(data).to.equals('database connection test returned wrong result');
        };

        fakeServer.register = function(plugin, next) {
            return next();
        };

        mockConfig.environment = ENV_DEV;
        dbTestResult = 3;
        Db.register(fakeServer, null, function(err) {

            expect(err).to.not.exist();
            dbTestResult = 2;
            done();
        });
    });

    it('handles db connection test unexpected result with postgresql', {
        parallel: false
    }, function(done) {

        var Db = require('../../lib/plugins/db'); // Have to require this after knex is mocked by mockery

        var fakeServer = {};
        fakeServer.log = function(tags, data) {
            expect(tags).to.contains('db');
            expect(tags).to.contains('error');
            expect(data).to.equals('database connection test returned wrong result');
        };

        fakeServer.register = function(plugin, next) {
            return next();
        };

        mockConfig.environment = ENV_STAGING;
        dbTestResult = 3;
        Db.register(fakeServer, null, function(err) {

            mockConfig.environment = ENV_DEV;
            dbTestResult = 2;
            expect(err).to.not.exist();
            done();
        });
    });

    it('logs database connection start', {
        parallel: false
    }, function(done) {

        var Db = require('../../lib/plugins/db'); // Have to require this after knex is mocked by mockery

        var fakeServer = {};
        fakeServer.log = function(tags, data) {
            expect(tags).to.contains('db');
            expect(tags).to.contains('start');
            expect(data).to.equals(mockKnexConfig[mockConfig.environment]);
        };

        fakeServer.decorate = fakeServer.ext = function() {};

        fakeServer.register = function(plugin, next) {
            return next();
        };

        Db.register(fakeServer, null, function(err) {

            expect(err).to.not.exist();
            done();
        });

    });

    it('decorates the server with knex and objection', {
        parallel: false
    }, function(done) {

        var Db = require('../../lib/plugins/db'); // Have to require this after knex is mocked by mockery

        var fakeServer = {};
        fakeServer.decorate = function(type, property, method) {
            expect(type).to.equals('server');
            expect(property).to.equals('db');
            expect(method.query).to.equals(mockKnexInstance);
            expect(method.model).to.equals(mockObjection.Model);
        };

        fakeServer.register = function(plugin, next) {
            return next();
        };

        fakeServer.ext = fakeServer.log = function() {};

        Db.register(fakeServer, null, function(err) {

            expect(err).to.not.exist();
            done();
        });
    });

    it('logs database connection stop', {
        parallel: false
    }, function(done) {

        Manager.start(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exist();
            expect(server).to.be.instanceof(Hapi.Server);

            var orig = server.log;
            server.log = function(tags) {
                server.log = orig;
                expect(tags).to.contains('db');
                expect(tags).to.contains('stop');
            };

            Manager.stop(done);
        });

    });

    it('destroys knex after server stop', {
        parallel: false
    }, function(done) {

        Manager.start(internals.manifest, internals.composeOptions, function(err, server) {

            var orig = mockKnexInstance.destroy;
            mockKnexInstance.destroy = function(next) {
                mockKnexInstance.destroy = orig;
                expect(next).to.be.a.function();
                next();
            };

            expect(err).to.not.exist();
            expect(server).to.be.instanceof(Hapi.Server);
            Manager.stop(done);
        });
    });

});
