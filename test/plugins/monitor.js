'use strict';

var Code = require('code'); // the assertions library
var Lab = require('lab'); // the test framework
var Path = require('path');
var Mockery = require('mockery'); // mock global node require
var Config = require('../../lib/config');
var Monitor = require('../../lib/plugins/monitor');
var Manager = require('../../lib/manager');

var lab = exports.lab = Lab.script(); // export the test script

// make lab feel like jasmine
var describe = lab.experiment;
var it = lab.test;
var before = lab.before;
var expect = Code.expect;
var fail = Code.fail;

var internals = {};
internals.manifest = {
    connections: [{
        port: 0,
        labels: ['web-tls', 'web', 'api']
    }],
    registrations: [{
        plugin: '../test/fixtures/auth-plugin'
    }, {
        plugin: './plugins/monitor'
    }]
};

internals.composeOptions = {
    relativeTo: Path.resolve(__dirname, '../../lib'),
};

describe('Plugin: monitor', function() {

    before(function(done) {

        Mockery.enable({
            warnOnReplace: false,
            warnOnUnregistered: false
        });

        Mockery.registerMock('rotating-file-stream', function() {

            // mock node stream
            return {
                on: function() {},
                once: function() {},
                end: function() {},
                emit: function() {},
                pipe: function() {}
            };
        });

        done();

    });

    it('should register the good plugin', function(done) {

        var fakeServer = {
            on: function() {},
            ext: function() {},
            select: function() {
                return this;
            },
            register: function(plugins, next) {
                expect(plugins).to.satisfy(function(value) {
                    return value.some(function(plugin) {
                        return plugin.register.register.attributes.pkg.name === 'good';
                    });
                });
                return next();
            }
        };

        Monitor.register(fakeServer, null, function(error) {

            expect(error).to.not.exist();
            done();
        });
    });

    it('should register the hapijs-status-monitor plugin', function(done) {

        var fakeServer = {
            on: function() {},
            ext: function() {},
            select: function() {
                return this;
            },
            register: function(plugins, next) {
                expect(plugins).to.satisfy(function(value) {
                    return value.some(function(plugin) {
                        return plugin.register.register.attributes.pkg.name === 'hapijs-status-monitor';
                    });
                });
                return next();
            }
        };

        Monitor.register(fakeServer, null, function(error) {

            expect(error).to.not.exist();
            done();
        });
    });

    it('handle good plugin registration failure', function(done) {

        var PLUGIN_ERROR = 'plugin error';
        var fakeServer = {
            on: function() {},
            ext: function() {},
            select: function() {
                return this;
            },
            register: function(plugin, next) {
                return next(new Error(PLUGIN_ERROR));
            }
        };

        Monitor.register(fakeServer, null, function(error) {

            expect(error).to.exist();
            expect(error.message).to.equals(PLUGIN_ERROR);
            done();
        });
    });

    it('should register the console reporter', function(done) {

        var fakeServer = {
            on: function() {},
            ext: function() {},
            select: function() {
                return this;
            },
            register: function(plugins, next) {
                expect(plugins).to.satisfy(function(value) {
                    return value.some(function(plugin) {

                        if (!plugin.options.reporters || !plugin.options.reporters.console) {
                            return false;
                        }

                        return true;

                    });
                });
                return next();
            }
        };

        Monitor.register(fakeServer, null, function(error) {

            expect(error).to.not.exist();
            done();
        });
    });

    it('should register the file reporters', function(done) {

        var fakeServer = {
            on: function() {},
            ext: function() {},
            select: function() {
                return this;
            },
            register: function(plugins, next) {
                expect(plugins).to.satisfy(function(value) {
                    return value.some(function(plugin) {
                        if (!plugin.options.reporters ||
                            !plugin.options.reporters.ops ||
                            !plugin.options.reporters.access ||
                            !plugin.options.reporters.auth ||
                            !plugin.options.reporters.error) {
                            return false;
                        }

                        return true;
                    });
                });
                return next();
            }
        };

        Monitor.register(fakeServer, null, function(error) {

            expect(error).to.not.exist();
            done();
        });
    });


    it('handles request events with debug disabled', {
        parallel: false
    }, function(done) {

        var orig = Config.monitor.debug;
        Config.monitor.debug = false;

        var eventData = {
            tags: ['someTag'],
            data: {
                info: {},
            }
        };

        var requestData = {
            payload: {}
        };

        var fakeServer = {
            ext: function() {},
            select: function() {
                return this;
            },
            on: function(event, next) {
                expect(event).to.match(/(route|request|response)/);
                expect(next).to.be.a.function();
                if (event === 'request') {
                    next(requestData, eventData);
                }
            },
            log: function(tags, data) {
                expect(tags).to.equals(eventData.tags);
                expect(data.info).to.exist();
            },
            register: function(plugin, next) {
                return next();
            }
        };

        Monitor.register(fakeServer, null, function(error) {

            expect(error).to.not.exist();
            Config.monitor.debug = orig;
            done();
        });
    });

    it('handles request events with data object', {
        parallel: false
    }, function(done) {

        var orig = Config.monitor.debug;
        Config.monitor.debug = true;

        var REQ_ID = 'XPTO';

        var requestData = {
            url: {
                path: '/'
            },
            info: {
                remoteAddress: '127.0.0.1'
            },
            headers: {},
            payload: {}
        };
        requestData.headers['x-forwarded-for'] = requestData.info.remoteAddress;

        var eventData = {
            tags: ['someTag'],
            request: 'xxx:yyy:zzz:' + REQ_ID,
            data: {
                info: {}
            }
        };

        var fakeServer = {
            ext: function() {},
            select: function() {
                return this;
            },
            on: function(event, next) {
                expect(event).to.match(/(route|request|response)/);
                expect(next).to.be.a.function();
                if (event === 'request') {
                    next(requestData, eventData);
                }
            },
            log: function(tags, data) {

                expect(tags).to.equals(eventData.tags);
                expect(data.request).to.equals(REQ_ID);
                expect(data.path).to.equals(requestData.url.path);
                expect(data.address).to.equals(requestData.info.remoteAddress);
                expect(data.info).to.exist();
            },
            register: function(plugin, next) {
                return next();
            }
        };

        Monitor.register(fakeServer, null, function(error) {

            expect(error).to.not.exist();
            Config.monitor.debug = orig;
            done();
        });
    });

    it('handles request events with data string', {
        parallel: false
    }, function(done) {

        var orig = Config.monitor.debug;
        Config.monitor.debug = true;

        var REQ_ID = 'XPTO';

        var requestData = {
            url: {
                path: '/'
            },
            info: {
                remoteAddress: '127.0.0.1'
            },
            headers: {},
            payload: {}
        };
        requestData.headers['x-forwarded-for'] = requestData.info.remoteAddress;

        var eventData = {
            tags: ['someTag'],
            request: 'xxx:yyy:zzz:' + REQ_ID,
            data: 'some string'
        };

        var fakeServer = {
            ext: function() {},
            select: function() {
                return this;
            },
            on: function(event, next) {
                expect(event).to.match(/(route|request|response)/);
                expect(next).to.be.a.function();
                if (event === 'request') {
                    next(requestData, eventData);
                }
            },
            log: function(tags, data) {

                expect(tags).to.equals(eventData.tags);
                expect(data.request).to.equals(REQ_ID);
                expect(data.path).to.equals(requestData.url.path);
                expect(data.address).to.equals(requestData.info.remoteAddress);
                expect(data.message).to.equals(eventData.data);
            },
            register: function(plugin, next) {
                return next();
            }
        };

        Monitor.register(fakeServer, null, function(error) {

            expect(error).to.not.exist();
            Config.monitor.debug = orig;
            done();
        });
    });

    it('handles error logging of internal server errors', {
        parallel: false
    }, function(done) {

        var orig = Config.monitor.debug;
        Config.monitor.debug = true;

        var fakeRequest = {
            response: {
                isServer: true,
                isBoom: true,
                data: 'error'
            },
            log: function(tags, data) {
                expect(tags[0]).to.equals('error');
                expect(data).to.equals(this.response.data);
            }
        };

        var fakeServer = {
            on: function() {},
            select: function() {
                return this;
            },
            register: function(plugin, next) {
                return next();
            },
            ext: function(event, handler) {
                expect(event).to.equals('onPreResponse');
                handler(fakeRequest, {
                    continue: function() {}
                });
            }
        };

        Monitor.register(fakeServer, null, function(error) {

            expect(error).to.not.exist();
            Config.monitor.debug = orig;
            done();
        });
    });

    it('does not handle error logging for non error responses', {
        parallel: false
    }, function(done) {

        var orig = Config.monitor.debug;
        Config.monitor.debug = true;

        var fakeRequest = {
            response: {
                isServer: false,
                isBoom: false
            }
        };

        var fakeServer = {
            on: function() {},
            select: function() {
                return this;
            },
            register: function(plugin, next) {
                return next();
            },
            ext: function(event, handler) {
                expect(event).to.equals('onPreResponse');
                handler(fakeRequest, {
                    continue: function() {}
                });
            }
        };

        Monitor.register(fakeServer, null, function(error) {

            expect(error).to.not.exist();
            Config.monitor.debug = orig;
            done();
        });
    });

    it('handles response events for api server', {
        parallel: false
    }, function(done) {

        var orig = Config.monitor.debug;
        Config.monitor.debug = true;

        var fakeResponse = {};
        var fakeServer = {
            on: function(event, next) {
                expect(event).to.match(/(route|request|response)/);
                expect(next).to.be.a.function();
                if (event === 'response') {
                    next({
                        response: fakeResponse
                    });

                    fakeResponse.source = {};

                    next({
                        response: fakeResponse
                    });
                }
            },
            ext: function() {},
            select: function() {
                return this;
            },
            register: function(plugin, next) {
                return next();
            },
            log: function(tags, data) {

                if (!fakeResponse.source) {
                    fail('response should not be logged if source is not available');
                }
                expect(tags).to.be.an.array();
                expect(tags).to.contains('response');
                expect(tags).to.contains('debug');
                expect(data).to.equals(fakeResponse.source);
            }
        };

        Monitor.register(fakeServer, null, function(error) {

            expect(error).to.not.exist();
            Config.monitor.debug = orig;
            done();
        });
    });

    it('logs route events', {
        parallel: false // required as Config plugin is changed during execution
    }, function(done) {

        var orig = Config.monitor.debug;
        Config.monitor.debug = false; // prevents debug logging during tests

        Manager.start(internals.manifest, internals.composeOptions, function(err, server) {

            var route = {
                method: 'get',
                path: '/',
                handler: function() {}
            };

            server.once('log', function(event, tags) {
                expect(tags.server).to.be.true();
                expect(tags.route).to.be.true();
                expect(tags.debug).to.be.true();
                expect(event.data.plugin).to.exist();
                expect(event.data.method).to.equal(route.method);
                expect(event.data.path).to.equal(route.path);
                Config.monitor.debug = orig;
                Manager.stop(done);
            });

            server.route(route);

        });
    });

    it('logs request events', {
        parallel: false // required as Config plugin is changed during execution
    }, function(done) {

        var orig = Config.monitor.debug;
        Config.monitor.debug = false; // prevents debug logging during tests

        Manager.start(internals.manifest, internals.composeOptions, function(err, server) {

            var requestData = {
                user: 'test',
                payload: {}
            };

            var route = {
                method: 'get',
                path: '/',
                handler: function(request) {
                    request.log(['debug', 'someTag'], requestData);
                }
            };

            server.once('request', function(serverObj, event, tags) {
                expect(event.data).to.equals(requestData);
                expect(tags).to.include(['debug', 'someTag']);
                Config.monitor.debug = orig;
                Manager.stop(done);
            });

            server.route(route);
            server.inject('/', function() {});

        });
    });

    it('logs request events with no data', {
        parallel: false // required as Config plugin is changed during execution
    }, function(done) {

        var orig = Config.monitor.debug;
        Config.monitor.debug = false; // prevents debug logging during tests

        Manager.start(internals.manifest, internals.composeOptions, function(err, server) {

            var route = {
                method: 'get',
                path: '/',
                handler: function(request) {
                    request.log(['debug', 'someTag']);
                }
            };

            server.once('request', function(serverObj, event, tags) {
                expect(tags).to.include(['debug', 'someTag']);
                Config.monitor.debug = orig;
                Manager.stop(done);
            });

            server.route(route);
            server.inject('/', function() {});

        });
    });

    it('registers server log events to console reporter', {
        parallel: false // required as Config plugin is changed during execution
    }, function(done) {

        var origDebug = Config.monitor.debug;
        Config.monitor.debug = false;

        var fakeServer = {};
        fakeServer.on = fakeServer.ext = function() {};
        fakeServer.select = function() {
            return fakeServer;
        };
        fakeServer.register = function(plugins, next) {
            expect(plugins).to.satisfy(function(value) {
                return value.some(function(plugin) {
                    if (!plugin.options || !plugin.options.reporters || !plugin.options.reporters.console) {
                        return false;
                    }

                    if (!plugin.options.reporters.console[0] || !plugin.options.reporters.console[0].args) {
                        return false;
                    }

                    if (plugin.options.reporters.console[0].args[0].response || plugin.options.reporters.console[0].args[0].route) {
                        return false;
                    }

                    return true;

                });
            });
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
        fakeServer.on = fakeServer.ext = function() {};
        fakeServer.select = function() {
            return fakeServer;
        };

        fakeServer.register = function(plugins, next) {
            expect(plugins).to.satisfy(function(value) {
                return value.some(function(plugin) {
                    if (!plugin.options || !plugin.options.reporters || !plugin.options.reporters.console) {
                        return false;
                    }

                    if (!plugin.options.reporters.console[0] || !plugin.options.reporters.console[0].args) {
                        return false;
                    }

                    if (!plugin.options.reporters.console[0].args[0].response || !plugin.options.reporters.console[0].args[0].route) {
                        return false;
                    }

                    return true;

                });
            });
            return next();
        };

        Monitor.register(fakeServer, null, function(error) {

            expect(error).to.not.exist();
            Config.monitor.debug = origDebug;
            done();
        });

    });

});
