'use strict';

var Mockery = require('mockery'); // mock global node require
var Code = require('code'); // the assertions library
var Lab = require('lab'); // the test framework
var JWT = require('jsonwebtoken');
var MockUserService = require('../fixtures/user-service');
var HSError = require('../../lib/error');


var lab = exports.lab = Lab.script(); // export the test script

// make lab feel like jasmine
var describe = lab.experiment;
var before = lab.before;
var it = lab.test;
var expect = Code.expect;

var internals = {};
internals.user = {
    'id': 0,
    'email': 'test@gmail.com',
    'password': 'test'
};

describe('Controller: login', function() {

    var LoginCtrl;

    before(function(done) {

        Mockery.enable({
            warnOnReplace: false,
            warnOnUnregistered: false
        });

        Mockery.registerMock('../services/user', MockUserService);
        MockUserService.setUsers([internals.user]);

        LoginCtrl = require('../../lib/controllers/login');
        done();

    });

    it('invalid email address', function(done) {

        var request = {
            payload: {
                email: 'invalid',
                password: internals.user.password
            },
            log: function() {}
        };

        LoginCtrl.login(request, function(response) {

            expect(response.isBoom).to.equal(true);
            expect(response.output.statusCode).to.equal(401);
            expect(response.output.payload.error).to.equal('Unauthorized');
            expect(response.output.payload.message).to.equal(HSError.AUTH_INVALID_EMAIL);
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

        LoginCtrl.login(request, function(response) {

            expect(response.isBoom).to.equal(true);
            expect(response.output.statusCode).to.equal(401);
            expect(response.output.payload.error).to.equal('Unauthorized');
            expect(response.output.payload.message).to.equal(HSError.AUTH_INVALID_PASSWORD);
            done();
        });
    });

    it('web valid credentials', function(done) {

        var request = {
            payload: {
                email: internals.user.email,
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

        LoginCtrl.login(request, function(response) {

            expect(response).to.not.exist();
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
                email: internals.user.email,
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

        LoginCtrl.login(request, function(response) {

            expect(response).to.not.exist();
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
