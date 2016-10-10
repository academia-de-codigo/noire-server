'use strict';

var Code = require('code'); // the assertions library
var Lab = require('lab'); // the test framework
var Path = require('path');
var Url = require('url');
var Server = require('../../lib/server');
var Config = require('../../lib/config');

var lab = exports.lab = Lab.script(); // export the test script

// make lab feel like jasmine
var describe = lab.experiment;
var before = lab.before;
var after = lab.after;
var it = lab.test;
var expect = Code.expect;

var internals = {};
internals.manifest = {
    connections: [{
        host: 'localhost',
        port: 0,
        labels: ['web']
    }, {
        host: 'localhost',
        port: 0,
        labels: ['web-tls'],
        tls: Config.tls
    }, {
        host: 'localhost',
        port: 0,
        labels: ['api'],
        tls: Config.tls
    }],
    registrations: [{
        plugin: './plugins/auth',
        options: {
            select: ['web', 'web-tls']
        }
    }, {
        plugin: './plugins/routes',
        options: {
            select: ['web', 'web-tls'],
        }
    }, {
        plugin: './plugins/redirect',
        options: {
            select: ['web', 'web-tls']
        }
    }]
};

internals.webUrl = {
    protocol: 'http',
    slashes: true,
    hostname: Config.connections.web.host,
    port: Config.connections.web.port,
};

internals.webTlsUrl = {
    protocol: 'https',
    slashes: true,
    hostname: Config.connections.webTls.host,
    port: Config.connections.webTls.port,
};

internals.apiUrl = {
    protocol: 'https',
    slashes: true,
    hostname: Config.connections.api.host,
    port: Config.connections.api.port,
};

internals.composeOptions = {
    relativeTo: Path.resolve(__dirname, '../../lib')
};

describe('Plugin: redirect', function() {

    before(function(done) {

        // created using node -e "console.log(require('crypto').randomBytes(256).toString('base64'));"
        process.env.JWT_SECRET = 'qVLBNjLYpud1fFcrBT2ogRWgdIEeoqPsTLOVmwC0mWWJdmvKTHpVKu6LJ7vkO6UR6H7ZelCw/ESAuqwi2jiYf8+n3+jiwmwDL17hIHnFNlQeJ+ad9FgWYMA0QRYMqkz6AHQSYCRIhUsdPBcC0G2FNZ9qxIEDwpIh87Phwlj7JvskIxsOeoOdKFcGFENtRgDhO2hZtxGHlrQIbot2PFJJp/oLGELA39myjX86Swqer/3HCcj1pjS5PU4CkZRzIch1MVYSoRVIYl9jxryEJKCG5ftgVnGXeHBTpbSMc9gndpALeL3ypAKnVUxHsQSfyFpRBLXRad7XABB9bz/2jfedrQ==';
        done();

    });

    after(function(done) {
        process.env.JWT_SECRET = '';
        done();
    });

    it('http api requests redirected to https', function(done) {

        var redirectUrl = Url.format(internals.apiUrl) + Path.resolve(Config.prefixes.api, 'version');
        Server.init(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exist();
            var web = server.select('web');
            web.inject(Path.resolve(Config.prefixes.api, 'version'), function(response) {

                expect(response.statusCode).to.equal(301);
                expect(response.statusMessage).to.equal('Moved Permanently');
                expect(response.headers.location).to.equal(redirectUrl);
                server.stop(done); // done() callback is required to end the test.

            });

        });

    });

    it('http admin requests redirected to https', function(done) {

        var redirectUrl = Url.format(internals.webTlsUrl) + Config.prefixes.admin;
        Server.init(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exist();
            var web = server.select('web');
            web.inject(Config.prefixes.admin, function(response) {

                expect(response.statusCode).to.equal(301);
                expect(response.statusMessage).to.equal('Moved Permanently');
                expect(response.headers.location).to.equal(redirectUrl);
                server.stop(done); // done() callback is required to end the test.
            });

        });

    });

    it('http account requests redirected to https', function(done) {

        var redirectUrl = Url.format(internals.webTlsUrl) + Config.prefixes.account;
        Server.init(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exist();
            var web = server.select('web');
            web.inject(Config.prefixes.account, function(response) {

                expect(response.statusCode).to.equal(301);
                expect(response.statusMessage).to.equal('Moved Permanently');
                expect(response.headers.location).to.equal(redirectUrl);
                server.stop(done); // done() callback is required to end the test.
            });

        });

    });

    it('http login requests redirected to https', function(done) {

        var redirectUrl = Url.format(internals.webTlsUrl) + Config.paths.login;
        Server.init(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exist();
            var web = server.select('web');
            web.inject(Config.paths.login, function(response) {

                expect(response.statusCode).to.equal(301);
                expect(response.statusMessage).to.equal('Moved Permanently');
                expect(response.headers.location).to.equal(redirectUrl);
                server.stop(done); // done() callback is required to end the test.

            });

        });
    });

    it('http root request redirected to home', function(done) {

        var redirectUrl = Url.format(internals.webUrl) + '/home';
        Server.init(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exist();
            var web = server.select('web');
            web.inject('/', function(response) {

                expect(response.statusCode).to.equal(301);
                expect(response.statusMessage).to.equal('Moved Permanently');
                expect(response.headers.location).to.equal(redirectUrl);
                server.stop(done); // done() callback is required to end the test.

            });

        });
    });

    it('https root request redirected to home', function(done) {

        var redirectUrl = Url.format(internals.webTlsUrl) + Config.paths.home;
        Server.init(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exist();
            var webTls = server.select('web-tls');
            webTls.inject('/', function(response) {

                expect(response.statusCode).to.equal(301);
                expect(response.statusMessage).to.equal('Moved Permanently');
                expect(response.headers.location).to.equal(redirectUrl);
                server.stop(done); // done() callback is required to end the test.

            });

        });
    });

    it('https valid route', function(done) {

        Server.init(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exist();
            var webTls = server.select('web-tls');
            webTls.inject(Config.paths.home, function(response) {

                expect(response.statusCode).to.equal(200);
                expect(response.result).to.be.a.string();
                server.stop(done); // done() callback is required to end the test.

            });

        });
    });

});
