'use strict';

var Code = require('code'); // the assertions library
var Lab = require('lab'); // the test framework
var JWT = require('jsonwebtoken');
var Promise = require('bluebird');
var UserService = require('../../../lib/services/user');
var LoginCtrl = require('../../../lib/controllers/api/login');
var Sinon = require('sinon');
var HSError = require('../../../lib/error');


var lab = exports.lab = Lab.script(); // export the test script

// make lab feel like jasmine
var describe = lab.experiment;
var before = lab.before;
var it = lab.test;
var expect = Code.expect;

var internals = {};
internals.user = {
    'id': 0,
    'username': 'test',
    'email': 'test@gmail.com',
    'password': 'test'
};

describe('Controller: login', function() {

    before(function(done) {

        // created using node -e "console.log(require('crypto').randomBytes(256).toString('base64'));"
        internals.secret = 'qVLBNjLYpud1fFcrBT2ogRWgdIEeoqPsTLOVmwC0mWWJdmvKTHpVKu6LJ7vkO6UR6H7ZelCw/ESAuqwi2jiYf8+n3+jiwmwDL17hIHnFNlQeJ+ad9FgWYMA0QRYMqkz6AHQSYCRIhUsdPBcC0G2FNZ9qxIEDwpIh87Phwlj7JvskIxsOeoOdKFcGFENtRgDhO2hZtxGHlrQIbot2PFJJp/oLGELA39myjX86Swqer/3HCcj1pjS5PU4CkZRzIch1MVYSoRVIYl9jxryEJKCG5ftgVnGXeHBTpbSMc9gndpALeL3ypAKnVUxHsQSfyFpRBLXRad7XABB9bz/2jfedrQ==';
        process.env.JWT_SECRET = internals.secret;

        // created using npm run token
        internals.token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MCwiaWF0IjoxNDc5MDQzNjE2fQ.IUXsKd8zaA1Npsh3P-WST5IGa-w0TsVMKh28ONkWqr8';

        done();

    });

    it('invalid username', function(done) {

        var request = {
            payload: {
                username: 'invalid',
                password: internals.user.password
            },
            log: function() {}
        };

        var authenticateStub = Sinon.stub(UserService, 'authenticate');
        authenticateStub.withArgs(request.payload.username, request.payload.password).returns(Promise.reject(HSError.AUTH_INVALID_USERNAME));

        LoginCtrl.login(request, function(response) {

            expect(UserService.authenticate.calledOnce).to.be.true();
            expect(response.isBoom).to.equal(true);
            expect(response.output.statusCode).to.equal(401);
            expect(response.output.payload.error).to.equal('Unauthorized');
            expect(response.output.payload.message).to.equal(HSError.AUTH_INVALID_USERNAME);

            authenticateStub.restore();
            done();
        });
    });

    it('invalid password', function(done) {

        var request = {
            payload: {
                email: internals.user.email,
                password: 'invalid'
            },
            log: function() {}
        };

        var authenticateStub = Sinon.stub(UserService, 'authenticate');
        authenticateStub.withArgs(request.payload.username, request.payload.password).returns(Promise.reject(HSError.AUTH_INVALID_PASSWORD));

        LoginCtrl.login(request, function(response) {

            expect(UserService.authenticate.calledOnce).to.be.true();
            expect(response.isBoom).to.equal(true);
            expect(response.output.statusCode).to.equal(401);
            expect(response.output.payload.error).to.equal('Unauthorized');
            expect(response.output.payload.message).to.equal(HSError.AUTH_INVALID_PASSWORD);

            authenticateStub.restore();
            done();
        });
    });

    it('handles internal server errors', function(done) {

        var request = {
            payload: {
                username: internals.user.username,
                password: internals.user.password
            },
            log: function() {}
        };

        var authenticateStub = Sinon.stub(UserService, 'authenticate');
        authenticateStub.withArgs(request.payload.username, request.payload.password).returns(Promise.reject(HSError.AUTH_ERROR));

        LoginCtrl.login(request, function(response) {

            expect(UserService.authenticate.calledOnce).to.be.true();
            expect(response.isBoom).to.equal(true);
            expect(response.output.statusCode).to.equal(500);
            expect(response.output.payload.error).to.equal('Internal Server Error');
            expect(response.output.payload.message).to.equal('An internal server error occurred');

            authenticateStub.restore();
            done();
        });
    });

    it('web valid credentials', function(done) {

        var request = {
            payload: {
                username: internals.user.username,
                password: internals.user.password
            },
            route: {
                settings: {
                    plugins: {
                        stateless: false
                    }
                }
            },
            log: function() {}
        };

        var authenticateStub = Sinon.stub(UserService, 'authenticate');
        authenticateStub.withArgs(request.payload.username, request.payload.password).returns(Promise.resolve(internals.token));

        LoginCtrl.login(request, function(response) {

            expect(UserService.authenticate.calledOnce).to.be.true();
            expect(response).to.exist();
            expect(response.success).to.be.true();
            expect(response.message).to.be.a.string();

            authenticateStub.restore();

            return {
                header: function(header, token) {
                    expect(header).to.equal('Authorization');
                    expect(token).to.be.a.string();

                    JWT.verify(token, new Buffer(process.env.JWT_SECRET, 'base64'), function(err, decoded) {

                        expect(err).not.to.exist();
                        expect(decoded.id).to.equals(internals.user.id);
                    });

                    return {
                        state: function(name, value, options) {
                            expect(name).to.equals('token');
                            expect(value).to.equals(token);
                            expect(options).to.exist();
                            done();
                        }
                    };
                }
            };
        });
    });

    it('api valid credentials', function(done) {

        var request = {
            payload: {
                username: internals.user.username,
                password: internals.user.password
            },
            route: {
                settings: {
                    plugins: {
                        stateless: true
                    }
                }
            },
            log: function() {}
        };

        var authenticateStub = Sinon.stub(UserService, 'authenticate');
        authenticateStub.withArgs(request.payload.username, request.payload.password).returns(Promise.resolve(internals.token));

        LoginCtrl.login(request, function(response) {

            expect(UserService.authenticate.calledOnce).to.be.true();
            expect(response).to.exist();
            expect(response.success).to.be.true();
            expect(response.message).to.be.a.string();

            authenticateStub.restore();

            return {
                header: function(header, token) {
                    expect(header).to.equal('Authorization');
                    expect(token).to.be.a.string();

                    JWT.verify(token, new Buffer(process.env.JWT_SECRET, 'base64'), function(err, decoded) {

                        expect(err).not.to.exist();
                        expect(decoded.id).to.equals(internals.user.id);
                        done();
                    });
                }
            };
        });
    });

    it('web logout', function(done) {

        var request = {
            route: {
                settings: {
                    plugins: {
                        stateless: false
                    }
                }
            },
            log: function() {}
        };

        LoginCtrl.logout(request, function(result) {
            expect(result).to.exist();
            expect(result.message).to.be.a.string();

            return {
                unstate: function(name) {
                    expect(name).to.equals('token');
                    done();
                }
            };
        });

    });

    it('api logout', function(done) {

        var request = {
            route: {
                settings: {
                    plugins: {
                        stateless: true
                    }
                }
            },
            log: function() {}
        };

        LoginCtrl.logout(request, function(result) {
            expect(result).to.exist();
            expect(result.message).to.be.a.string();
            done();
        });

    });
});
