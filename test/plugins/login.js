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
    }]
};

internals.user = {
    'id': 0,
    'email': 'test@gmail.com',
    'password': 'test'
};

internals.composeOptions = {
    relativeTo: Path.resolve(__dirname, '../../lib')
};

describe('Plugin: login', function() {

    before(function(done) {

        // created using node -e "console.log(require('crypto').randomBytes(256).toString('base64'));"
        process.env.JWT_SECRET = 'qVLBNjLYpud1fFcrBT2ogRWgdIEeoqPsTLOVmwC0mWWJdmvKTHpVKu6LJ7vkO6UR6H7ZelCw/ESAuqwi2jiYf8+n3+jiwmwDL17hIHnFNlQeJ+ad9FgWYMA0QRYMqkz6AHQSYCRIhUsdPBcC0G2FNZ9qxIEDwpIh87Phwlj7JvskIxsOeoOdKFcGFENtRgDhO2hZtxGHlrQIbot2PFJJp/oLGELA39myjX86Swqer/3HCcj1pjS5PU4CkZRzIch1MVYSoRVIYl9jxryEJKCG5ftgVnGXeHBTpbSMc9gndpALeL3ypAKnVUxHsQSfyFpRBLXRad7XABB9bz/2jfedrQ==';
        done();

    });

    after(function(done) {
        process.env.JWT_SECRET = '';
        done();
    });

    it('joi validates invalid email', function(done) {

        Server.init(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exists();
            server.inject({
                method: 'POST',
                url: Config.paths.login,
                payload: {
                    email: 'invalid'
                }
            }, function(response) {

                expect(response.statusCode).to.equals(400);
                expect(response.statusMessage).to.equals('Bad Request');
                expect(response.payload).to.be.a.string();
                expect(JSON.parse(response.payload)).to.be.an.object();
                expect(JSON.parse(response.payload).validation).to.be.an.object();
                expect(JSON.parse(response.payload).validation.keys).to.be.an.array();
                expect(JSON.parse(response.payload).validation.keys[0]).to.equals('email');
                done();

            });
        });
    });

    it('joi validates invalid passwrd', function(done) {

        Server.init(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exists();

            server.inject({
                method: 'POST',
                url: Config.paths.login,
                payload: {
                    email: internals.user.email,
                    password: 'x'
                }
            }, function(response) {

                expect(response.statusCode).to.equals(400);
                expect(response.statusMessage).to.equals('Bad Request');
                expect(response.payload).to.be.a.string();
                expect(JSON.parse(response.payload)).to.be.an.object();
                expect(JSON.parse(response.payload).validation).to.be.an.object();
                expect(JSON.parse(response.payload).validation.keys).to.be.an.array();
                expect(JSON.parse(response.payload).validation.keys[0]).to.equals('password');
                done();

            });
        });
    });

    it('login successful', function(done) {

        Server.init(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exists();

            server.inject({
                method: 'POST',
                url: Config.paths.login,
                payload: {
                    email: internals.user.email,
                    password: internals.user.password
                }
            }, function(response) {

                expect(response.request.route.settings.plugins.stateless).to.be.false();
                expect(response.request.auth.mode).to.be.null();
                expect(response.statusCode).to.equals(200);
                done();

            });
        });
    });

    it('logout successful', function(done) {

        Server.init(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exists();

            server.inject({
                method: 'GET',
                url: Config.paths.logout,
                credentials: internals.user
            }, function(response) {

                expect(response.request.route.settings.plugins.stateless).to.be.false();
                expect(response.request.auth.mode).not.to.be.null();
                expect(response.statusCode).to.equals(200);
                done();

            });
        });
    });

});
