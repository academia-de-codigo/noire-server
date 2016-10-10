'use strict';

var Code = require('code'); // the assertions library
var Lab = require('lab'); // the test framework
var Path = require('path');
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
    }],
    registrations: [{
        plugin: './plugins/auth'
    }, {
        plugin: './plugins/login'
    }, {
        plugin: './plugins/errors'
    }, {
        plugin: './plugins/routes'
    }, {
        plugin: './plugins/assets'
    }]
};

internals.composeOptions = {
    relativeTo: Path.resolve(__dirname, '../../lib')
};

describe('Plugin: errors', function() {

    before(function(done) {

        // created using node -e "console.log(require('crypto').randomBytes(256).toString('base64'));"
        process.env.JWT_SECRET = 'qVLBNjLYpud1fFcrBT2ogRWgdIEeoqPsTLOVmwC0mWWJdmvKTHpVKu6LJ7vkO6UR6H7ZelCw/ESAuqwi2jiYf8+n3+jiwmwDL17hIHnFNlQeJ+ad9FgWYMA0QRYMqkz6AHQSYCRIhUsdPBcC0G2FNZ9qxIEDwpIh87Phwlj7JvskIxsOeoOdKFcGFENtRgDhO2hZtxGHlrQIbot2PFJJp/oLGELA39myjX86Swqer/3HCcj1pjS5PU4CkZRzIch1MVYSoRVIYl9jxryEJKCG5ftgVnGXeHBTpbSMc9gndpALeL3ypAKnVUxHsQSfyFpRBLXRad7XABB9bz/2jfedrQ==';
        done();

    });

    after(function(done) {
        process.env.JWT_SECRET = '';
        done();
    });

    it('404 not found errors redirected to root', function(done) {

        Server.init(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exist();
            server.inject('/invalid-route', function(response) {

                expect(response.statusCode).to.equal(301);
                expect(response.statusMessage).to.equal('Moved Permanently');
                expect(response.headers.location).to.equal(response.request.connection.info.uri);
                server.stop(done); // done() callback is required to end the test.
            });

        });

    });

    it('malformed data', function(done) {

        Server.init(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exist();
            server.inject({
                method: 'POST',
                url: Config.paths.login,
                payload: {
                    email: 'invalid',
                    password: 'x'
                }
            }, function(response) {

                expect(response.statusCode).to.equal(400);
                expect(response.statusMessage).to.equal('Bad Request');
                expect(JSON.parse(response.payload).message).to.equal('Malformed Data Entered');
                server.stop(done); // done() callback is required to end the test.
            });

        });

    });

    it('insufficient scope', function(done) {

        Server.init(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exist();
            server.inject({
                method: 'GET',
                url: Config.prefixes.admin,
                credentials: {
                    scope: 'user'
                },
            }, function(response) {

                expect(response.statusCode).to.equal(302);
                expect(response.statusMessage).to.equal('Found');
                expect(response.headers.location).to.equal(response.request.connection.info.uri);
                server.stop(done); // done() callback is required to end the test.
            });

        });
    });

    it('invalid password', function(done) {

        Server.init(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exist();
            server.inject({
                method: 'POST',
                url: Config.paths.login,
                payload: {
                    email: 'test@gmail.com',
                    password: 'invalid'
                }
            }, function(response) {

                expect(response.statusCode).to.equal(401);
                expect(response.statusMessage).to.equal('Unauthorized');
                server.stop(done); // done() callback is required to end the test.
            });

        });

    });

    it('valid route with no errors', function(done) {

        Server.init(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exist();
            server.inject(Config.paths.login, function(response) {

                expect(response.statusCode).to.equal(200);
                expect(response.result).to.be.a.string();
                server.stop(done); // done() callback is required to end the test.
            });

        });
    });

    it('should not redirect assets', function(done) {

        Server.init(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exist();
            server.inject('/img/invalid', function(response) {

                expect(response.statusCode).to.equal(404);
                expect(response.statusMessage).to.equal('Not Found');
                server.stop(done); // done() callback is required to end the test.
            });

        });
    });

});
