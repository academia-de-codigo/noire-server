'use strict';

var Code = require('code'); // the assertions library
var Lab = require('lab'); // the test framework
var JWT = require('jsonwebtoken');
var Path = require('path');
var Auth = require('../../lib/plugins/auth');
var Manager = require('../../lib/manager');
var UserService = require('../../lib/services/user');
var Config = require('../../lib/config');

var lab = exports.lab = Lab.script(); // export the test script

// make lab feel like jasmine
var describe = lab.experiment;
var before = lab.before;
var beforeEach = lab.beforeEach;
var after = lab.after;
var afterEach = lab.afterEach;
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
        plugin: './plugins/routes'
    }, {
        plugin: 'vision'
    }]
};

internals.composeOptions = {
    relativeTo: Path.resolve(__dirname, '../../lib')
};

internals.user = {
    id: 0,
    username: 'test',
    email: 'test@gmail.com',
    password: 'test',
    roles: 'user'
};

describe('Plugin: auth', function() {

    before(function(done) {

        // created using node -e "console.log(require('crypto').randomBytes(256).toString('base64'));"
        internals.secret = 'qVLBNjLYpud1fFcrBT2ogRWgdIEeoqPsTLOVmwC0mWWJdmvKTHpVKu6LJ7vkO6UR6H7ZelCw/ESAuqwi2jiYf8+n3+jiwmwDL17hIHnFNlQeJ+ad9FgWYMA0QRYMqkz6AHQSYCRIhUsdPBcC0G2FNZ9qxIEDwpIh87Phwlj7JvskIxsOeoOdKFcGFENtRgDhO2hZtxGHlrQIbot2PFJJp/oLGELA39myjX86Swqer/3HCcj1pjS5PU4CkZRzIch1MVYSoRVIYl9jxryEJKCG5ftgVnGXeHBTpbSMc9gndpALeL3ypAKnVUxHsQSfyFpRBLXRad7XABB9bz/2jfedrQ==';
        internals.ID_INVALID = 2;

        internals.originalUsers = UserService.getUsers();
        UserService.setUsers([internals.user]);

        done();

    });

    after(function(done) {
        UserService.setUsers(internals.originalUsers);
        done();
    });

    beforeEach(function(done) {
        process.env.JWT_SECRET = internals.secret;
        done();
    });

    afterEach(function(done) {
        process.env.JWT_SECRET = '';
        done();
    });

    it('handle hapi-auth-jwt2 plugin registration failure', function(done) {

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

    it('get token and validate with correct secret', function(done) {

        var jwt = Auth.getToken(internals.ID_INVALID);
        JWT.verify(jwt, new Buffer(process.env.JWT_SECRET, 'base64'), function(err, decoded) {

            expect(err).not.to.exist();
            expect(decoded.id).to.equals(internals.ID_INVALID);

            done();
        });

    });

    it('get token and validate with incorrect secret', function(done) {

        var jwt = Auth.getToken(internals.ID_INVALID);
        JWT.verify(jwt, 'invalid secret', function(err, decoded) {

            expect(err).to.exist();
            expect(err.name).to.equals('JsonWebTokenError');
            expect(err.message).to.equals('invalid signature');
            expect(decoded).to.not.exist();

            done();
        });

    });

    it('secret not present', function(done) {

        var PLUGIN_ERROR = 'JWT_SECRET environment variable is empty';
        process.env.JWT_SECRET = '';
        Auth.register(null, null, function(error) {

            expect(error).to.exist();
            expect(error.message).to.equals(PLUGIN_ERROR);
            done();
        });

    });

    it('token not present', function(done) {

        Manager.start(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exist();

            server.inject(Config.prefixes.admin, function(response) {

                var payload = JSON.parse(response.payload);

                expect(response.statusCode, 'Status code').to.equal(401);
                expect(payload.error).to.equals('Unauthorized');
                expect(payload.message).to.equals('Missing authentication');
                Manager.stop(done);
            });

        });

    });

    it('invalid token', function(done) {

        Manager.start(internals.manifest, internals.composeOptions, function(err, server) {

            var invalidJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTkxMjM0MTIzNCwiaWF0IjoxNDczNzA2NzYzLCJleHAiOjE0NzM3MzU1NjN9.xjivOc1Smbf9M8uQHNTBTbcDBavXMjL-0oNxV-yxog0';

            expect(err).to.not.exist();

            server.inject({
                method: 'GET',
                url: Config.prefixes.admin,
                headers: {
                    authorization: invalidJwt
                }
            }, function(response) {

                var payload = JSON.parse(response.payload);

                expect(response.statusCode, 'Status code').to.equal(401);
                expect(payload.error).to.equals('Unauthorized');
                expect(payload.message).to.equals('Invalid token');
                Manager.stop(done);
            });

        });

    });

    it('invalid credentials', function(done) {

        Manager.start(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exist();

            server.inject({
                method: 'GET',
                url: Config.prefixes.admin,
                headers: {
                    authorization: Auth.getToken(internals.ID_INVALID)
                }
            }, function(response) {

                var payload = JSON.parse(response.payload);

                expect(response.statusCode, 'Status code').to.equal(401);
                expect(payload.error).to.equals('Unauthorized');
                expect(payload.message).to.equals('Invalid credentials');
                Manager.stop(done);
            });

        });
    });

    it('invalid scope', function(done) {

        Manager.start(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exist();

            server.inject({
                method: 'GET',
                url: Config.prefixes.admin,
                headers: {
                    authorization: Auth.getToken(internals.user.id)
                }
            }, function(response) {

                var payload = JSON.parse(response.payload);

                expect(response.statusCode, 'Status code').to.equal(403);
                expect(payload.error).to.equals('Forbidden');
                expect(payload.message).to.equals('Insufficient scope');
                Manager.stop(done);

            });

        });

    });

    it('valid credentials', function(done) {

        Manager.start(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exist();

            server.inject({
                method: 'GET',
                url: '/account',
                headers: {
                    authorization: Auth.getToken(internals.user.id)
                }
            }, function(response) {

                expect(response.statusCode, 'Status code').to.equal(200);
                expect(response.request.auth.isAuthenticated).to.be.true();
                expect(response.request.auth.credentials.id).to.equal(internals.user.id);
                expect(response.request.auth.credentials.username).to.equal(internals.user.username);
                expect(response.request.auth.credentials.email).to.equal(internals.user.email);
                expect(response.request.auth.credentials.scope).to.equal(internals.user.roles);
                Manager.stop(done);
            });

        });

    });

});
