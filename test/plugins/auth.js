'use strict';

var Code = require('code'); // the assertions library
var Lab = require('lab'); // the test framework
var JWT = require('jsonwebtoken');
var Auth = require('../../lib/plugins/auth');
var Server = require('../../lib/server');
var Path = require('path');

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
        plugin: './plugins/auth'
    }, {
        plugin: './plugins/restricted'
    }]
};

internals.composeOptions = {
    relativeTo: Path.resolve(__dirname, '../../lib')
};

describe('Plugin: auth', function() {

    // a test ID that should not exist
    var ID_INVALID = 1912341234;
    var ID_VALID = 2;

    // created using node -e "console.log(require('crypto').randomBytes(256).toString('base64'));"
    var secret = 'qVLBNjLYpud1fFcrBT2ogRWgdIEeoqPsTLOVmwC0mWWJdmvKTHpVKu6LJ7vkO6UR6H7ZelCw/ESAuqwi2jiYf8+n3+jiwmwDL17hIHnFNlQeJ+ad9FgWYMA0QRYMqkz6AHQSYCRIhUsdPBcC0G2FNZ9qxIEDwpIh87Phwlj7JvskIxsOeoOdKFcGFENtRgDhO2hZtxGHlrQIbot2PFJJp/oLGELA39myjX86Swqer/3HCcj1pjS5PU4CkZRzIch1MVYSoRVIYl9jxryEJKCG5ftgVnGXeHBTpbSMc9gndpALeL3ypAKnVUxHsQSfyFpRBLXRad7XABB9bz/2jfedrQ==';
    process.env.JWT_SECRET = secret;
    var jwt = Auth.getToken(ID_INVALID);

    it('get token and validate with correct secret', function(done) {

        JWT.verify(jwt, new Buffer(process.env.JWT_SECRET, 'base64'), function(err, decoded) {

            expect(err).not.to.exist();
            expect(decoded.id).to.equals(ID_INVALID);

            done();
        });

    });

    it('get token and validate with incorrect secret', function(done) {

        JWT.verify(jwt, 'invalid secret', function(err, decoded) {

            expect(err).to.exist();
            expect(err.name).to.equals('JsonWebTokenError');
            expect(err.message).to.equals('invalid signature');
            expect(decoded).to.not.exist();

            done();
        });

    });

    it('handle hapi-auth-jwt2 plugin registration failure', {
        parallel: false
    }, function(done) {

        var PLUGIN_ERROR = 'plugin error';
        var fakeServer = {};

        fakeServer.register = function(plugin, next) {
            return next(new Error(PLUGIN_ERROR));
        };

        Auth.register(fakeServer, null, function(error) {

            expect(error).to.exist();
            expect(error.message).to.equals(PLUGIN_ERROR);
            done();
        });

    });

    it('secret not present', function(done) {

        var PLUGIN_ERROR = 'JWT_SECRET environment variable is empty';

        var secret = process.env.JWT_SECRET;
        process.env.JWT_SECRET = '';

        Auth.register(null, null, function(error) {

            expect(error).to.exist();
            expect(error.message).to.equals(PLUGIN_ERROR);
            process.env.JWT_SECRET = secret;
            done();
        });

    });

    it('token not present', function(done) {

        Server.init(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exist();

            server.inject('/', function(response) {

                var payload = JSON.parse(response.payload);

                expect(response.statusCode, 'Status code').to.equal(401);
                expect(payload.error).to.equals('Unauthorized');
                expect(payload.message).to.equals('Missing authentication');
                server.stop(done);
            });

        });

    });

    it('invalid token', function(done) {

        Server.init(internals.manifest, internals.composeOptions, function(err, server) {

            var invalidJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTkxMjM0MTIzNCwiaWF0IjoxNDczNzA2NzYzLCJleHAiOjE0NzM3MzU1NjN9.xjivOc1Smbf9M8uQHNTBTbcDBavXMjL-0oNxV-yxog0';

            expect(err).to.not.exist();

            server.inject({
                method: 'GET',
                url: '/',
                headers: {
                    authorization: invalidJwt
                }
            }, function(response) {

                var payload = JSON.parse(response.payload);

                expect(response.statusCode, 'Status code').to.equal(401);
                expect(payload.error).to.equals('Unauthorized');
                expect(payload.message).to.equals('Invalid token');
                server.stop(done);
            });

        });

    });

    it('invalid credentials', function(done) {

        Server.init(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exist();

            server.inject({
                method: 'GET',
                url: '/',
                headers: {
                    authorization: Auth.getToken(ID_INVALID)
                }
            }, function(response) {

                var payload = JSON.parse(response.payload);

                expect(response.statusCode, 'Status code').to.equal(401);
                expect(payload.error).to.equals('Unauthorized');
                expect(payload.message).to.equals('Invalid credentials');
                server.stop(done);
            });

        });

    });

    it('valid credentials', function(done) {

        Server.init(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exist();

            server.inject({
                method: 'GET',
                url: '/',
                headers: {
                    authorization: Auth.getToken(ID_VALID)
                }
            }, function(response) {

                expect(response.statusCode, 'Status code').to.equal(200);
                server.stop(done);

            });

        });

    });

});
