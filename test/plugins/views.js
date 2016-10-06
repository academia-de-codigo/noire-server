'use strict';

var Code = require('code'); // the assertions library
var Lab = require('lab'); // the test framework
var Path = require('path');
var Config = require('../../lib/config');
var Server = require('../../lib/server');
var Views = require('../../lib/plugins/views');

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
        port: 0,
    }],
    registrations: [{
        plugin: './plugins/auth'
    }, {
        plugin: './plugins/views'
    }]
};

internals.composeOptions = {
    relativeTo: Path.resolve(__dirname, '../../lib')
};

describe('Plugin: views', function() {

    before(function(done) {

        // created using node -e "console.log(require('crypto').randomBytes(256).toString('base64'));"
        process.env.JWT_SECRET = 'qVLBNjLYpud1fFcrBT2ogRWgdIEeoqPsTLOVmwC0mWWJdmvKTHpVKu6LJ7vkO6UR6H7ZelCw/ESAuqwi2jiYf8+n3+jiwmwDL17hIHnFNlQeJ+ad9FgWYMA0QRYMqkz6AHQSYCRIhUsdPBcC0G2FNZ9qxIEDwpIh87Phwlj7JvskIxsOeoOdKFcGFENtRgDhO2hZtxGHlrQIbot2PFJJp/oLGELA39myjX86Swqer/3HCcj1pjS5PU4CkZRzIch1MVYSoRVIYl9jxryEJKCG5ftgVnGXeHBTpbSMc9gndpALeL3ypAKnVUxHsQSfyFpRBLXRad7XABB9bz/2jfedrQ==';
        done();

    });

    after(function(done) {
        process.env.JWT_SECRET = '';
        done();
    });

    it('handles vision plugin registration failure', {
        parallel: false
    }, function(done) {

        var PLUGIN_ERROR = 'plugin error';
        var fakeServer = {};

        fakeServer.register = function(plugin, next) {
            return next(new Error(PLUGIN_ERROR));
        };

        Views.register(fakeServer, null, function(error) {

            expect(error).to.exist();
            expect(error.message).to.equals(PLUGIN_ERROR);
            done();

        });

    });

    it('returns the home view', function(done) {

        Server.init(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exist();

            server.inject('/home', function(response) {

                expect(response.statusCode).to.equal(200);
                expect(response.result).to.be.a.string();
            });

            server.stop(done);
        });
    });

    it('returns the login view', function(done) {

        Server.init(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exist();

            server.inject('/login', function(response) {

                expect(response.statusCode).to.equal(200);
                expect(response.result).to.be.a.string();
            });

            server.stop(done);
        });
    });

    it('returns the admin page', function(done) {

        Server.init(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exist();
            server.inject({
                method: 'GET',
                url: Config.prefixes.admin,
                credentials: {
                    scope: 'admin'
                },
            }, function(response) {

                expect(response.statusCode).to.equal(200);
                expect(response.result).to.be.a.string();
            });

            server.stop(done);
        });
    });

    it('returns the user account page', function(done) {

        Server.init(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exist();
            server.inject({
                method: 'GET',
                url: Config.prefixes.account,
                credentials: {
                    scope: 'user'
                },
            }, function(response) {

                expect(response.statusCode).to.equal(200);
                expect(response.result).to.be.a.string();
            });

            server.stop(done);
        });
    });
});
