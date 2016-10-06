'use strict';

var Code = require('code'); // the assertions library
var Lab = require('lab'); // the test framework
var Url = require('url');
var JWT = require('jsonwebtoken');
var Config = require('../../lib/config');
var LoginCtrl = require('../../lib/controllers/login');
var UserService = require('../../lib/services/user');

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
internals.accountUrl = {
    protocol: 'https',
    slashes: true,
    hostname: Config.connections.webTls.host,
    port: Config.connections.webTls.port
};

internals.webUrl = {
    protocol: 'http',
    slashes: true,
    hostname: Config.connections.web.host,
    port: Config.connections.web.port
};


describe('Controller: login', function() {

    before(function(done) {

        // created using node -e "console.log(require('crypto').randomBytes(256).toString('base64'));"
        var secret = 'qVLBNjLYpud1fFcrBT2ogRWgdIEeoqPsTLOVmwC0mWWJdmvKTHpVKu6LJ7vkO6UR6H7ZelCw/ESAuqwi2jiYf8+n3+jiwmwDL17hIHnFNlQeJ+ad9FgWYMA0QRYMqkz6AHQSYCRIhUsdPBcC0G2FNZ9qxIEDwpIh87Phwlj7JvskIxsOeoOdKFcGFENtRgDhO2hZtxGHlrQIbot2PFJJp/oLGELA39myjX86Swqer/3HCcj1pjS5PU4CkZRzIch1MVYSoRVIYl9jxryEJKCG5ftgVnGXeHBTpbSMc9gndpALeL3ypAKnVUxHsQSfyFpRBLXRad7XABB9bz/2jfedrQ==';
        process.env.JWT_SECRET = secret;

        UserService.setUsers([internals.user]);
        done();
    });

    it('invalid email address', function(done) {

        var request = {
            payload: {
                email: 'invalid'
            }
        };

        LoginCtrl.login(request, function(response) {

            expect(response.isBoom).to.equal(true);
            expect(response.output.statusCode).to.equal(401);
            expect(response.output.payload.error).to.equal('Unauthorized');
            expect(response.output.payload.message).to.equal('Invalid email address');
            done();
        });
    });

    it('invalid password', function(done) {

        var request = {
            payload: {
                email: internals.user.email,
                password: 'invalid'
            }
        };

        LoginCtrl.login(request, function(response) {

            expect(response.isBoom).to.equal(true);
            expect(response.output.statusCode).to.equal(401);
            expect(response.output.payload.error).to.equal('Unauthorized');
            expect(response.output.payload.message).to.equal('Bad password');
            done();
        });
    });

    it('valid credentials', function(done) {

        var request = {
            payload: {
                email: internals.user.email,
                password: internals.user.password
            }
        };

        LoginCtrl.login(request, {

            redirect: function(url) {

                expect(url).to.exist();
                expect(url).to.equals(Url.format(internals.accountUrl) + Config.paths.home);
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
            }
        });
    });

    it('logout', function(done) {

        LoginCtrl.logout(null, {

            redirect: function(url) {
                expect(url).to.exist();
                expect(url).to.equals(Url.format(internals.webUrl) + Config.paths.home);

                return {
                    unstate: function(name, options) {
                        expect(name).to.equals('token');
                        expect(options).to.exist();
                        done();
                    }
                };
            }

        });

    });
});
