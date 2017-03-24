var Code = require('code'); // the assertions library
var Lab = require('lab'); // the test framework
var Sinon = require('sinon');
var Promise = require('bluebird');
var Path = require('path');
var UserService = require('../../lib/services/user');
var Manager = require('../../lib/manager');
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
        plugin: 'vision'
    }, {
        plugin: './plugins/auth'
    }, {
        plugin: './plugins/web-tls'
    }]
};

internals.user = {
    'id': 0,
    'username': 'test',
    'email': 'test@gmail.com',
    'password': 'test'
};

internals.composeOptions = {
    relativeTo: Path.resolve(__dirname, '../../lib')
};

describe('Plugin: web-tls', function() {

    before(function(done) {

        // created using node -e "console.log(require('crypto').randomBytes(256).toString('base64'));"
        process.env.JWT_SECRET = 'qVLBNjLYpud1fFcrBT2ogRWgdIEeoqPsTLOVmwC0mWWJdmvKTHpVKu6LJ7vkO6UR6H7ZelCw/ESAuqwi2jiYf8+n3+jiwmwDL17hIHnFNlQeJ+ad9FgWYMA0QRYMqkz6AHQSYCRIhUsdPBcC0G2FNZ9qxIEDwpIh87Phwlj7JvskIxsOeoOdKFcGFENtRgDhO2hZtxGHlrQIbot2PFJJp/oLGELA39myjX86Swqer/3HCcj1pjS5PU4CkZRzIch1MVYSoRVIYl9jxryEJKCG5ftgVnGXeHBTpbSMc9gndpALeL3ypAKnVUxHsQSfyFpRBLXRad7XABB9bz/2jfedrQ==';

        // created using npm run token
        internals.token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MCwiaWF0IjoxNDc5MDQzNjE2fQ.IUXsKd8zaA1Npsh3P-WST5IGa-w0TsVMKh28ONkWqr8';
        done();

    });

    after(function(done) {
        process.env.JWT_SECRET = '';
        done();
    });

    it('joi validates invalid username', function(done) {

        Manager.start(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exists();
            server.inject({
                method: 'POST',
                url: Config.prefixes.login,
                payload: {
                    username: 'x'
                }
            }, function(response) {

                expect(response.statusCode).to.equals(400);
                expect(response.statusMessage).to.equals('Bad Request');
                expect(response.payload).to.be.a.string();
                expect(JSON.parse(response.payload)).to.be.an.object();
                expect(JSON.parse(response.payload).validation).to.be.an.object();
                expect(JSON.parse(response.payload).validation.keys).to.be.an.array();
                expect(JSON.parse(response.payload).validation.keys[0]).to.equals('username');
                Manager.stop(done);

            });
        });
    });

    it('joi validates invalid password', function(done) {

        Manager.start(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exists();
            server.inject({
                method: 'POST',
                url: Config.prefixes.login,
                payload: {
                    username: internals.user.username,
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
                Manager.stop(done);

            });
        });
    });

    it('login successful', function(done) {

        var authenticateStub = Sinon.stub(UserService, 'authenticate');
        authenticateStub.withArgs(internals.user.username, internals.user.password).returns(Promise.resolve(internals.token));

        Manager.start(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exists();
            server.inject({
                method: 'POST',
                url: Config.prefixes.login,
                payload: {
                    username: internals.user.username,
                    password: internals.user.password
                }
            }, function(response) {

                expect(UserService.authenticate.calledOnce).to.be.true();
                expect(response.request.route.settings.plugins.stateless).to.be.false();
                expect(response.request.auth.mode).to.be.null();
                expect(response.statusCode).to.equals(200);
                authenticateStub.restore();
                Manager.stop(done);

            });
        });
    });

    it('logout successful', function(done) {

        Manager.start(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exists();
            server.inject({
                method: 'GET',
                url: Config.prefixes.logout,
                credentials: internals.user
            }, function(response) {

                expect(response.request.route.settings.plugins.stateless).to.be.false();
                expect(response.request.auth.mode).not.to.be.null();
                expect(response.statusCode).to.equals(200);
                Manager.stop(done);

            });
        });
    });

});
