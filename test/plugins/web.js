var Promise = require('bluebird');
var Code = require('code'); // the assertions library
var Lab = require('lab'); // the test framework
var Path = require('path');
var Exiting = require('exiting');
var Sinon = require('sinon');
var Config = require('../../lib/config');
var Manager = require('../../lib/manager');
var MockAuth = require('../fixtures/auth-plugin');
var Repository = require('../../lib/plugins/repository');
var UserService = require('../../lib/services/user');
var Web = require('../../lib/plugins/web');
var WebRoutes = require('../../lib/routes/web');
var Package = require('../../package.json');

var lab = exports.lab = Lab.script(); // export the test script

// make lab feel like jasmine
var describe = lab.experiment;
var before = lab.before;
var afterEach = lab.afterEach;
var it = lab.test;
var expect = Code.expect;

var internals = {};

internals.manifest = {
    connections: [{
        port: 0,
    }],
    registrations: [{
        plugin: '../test/fixtures/auth-plugin'
    }, {
        plugin: './plugins/web'
    }, {
        plugin: './plugins/views'
    }, {
        plugin: {
            register: './plugins/repository',
            options: {
                models: ['user', 'role', 'resource']
            }
        }
    }]
};

internals.composeOptions = {
    relativeTo: Path.resolve(__dirname, '../../lib')
};

internals.users = [{
    'id': 0,
    'username': 'test',
    'email': 'test@gmail.com',
    'roles': []
}, {
    'id': 1,
    'username': 'admin',
    'email': 'admin@gmail.com',
}];


describe('Plugin: web', function() {

    before(function(done) {
        Exiting.reset();
        done();
    });

    afterEach(function(done) {

        // Manager might not be properly stopped when tests fail
        if (Manager.getState() === 'started') {
            Manager.stop(done);
        } else {
            done();
        }

    });

    it('registers the view handler', function(done) {

        var fakeServer = {
            dependency: function(views, next) {
                expect(views).to.equals('views');
                next(this, function() {});
            },
            views: function(options) {
                expect(options).to.exist();
                expect(options.engines).to.exist();
                expect(options.engines.hbs).to.exist();
                expect(options.context).to.exist();
                expect(options.context.version).to.equals(Package.version);
            },
            route: function() {}
        };

        Web.register(fakeServer, null, function() {
            done();
        });
    });

    it('registers the route handler', function(done) {

        var fakeServer = {
            dependency: function(views, next) {
                next(this, function() {});
            },
            views: function() {},
            route: function(routes) {
                expect(routes).to.equals(WebRoutes.endpoints);
            }
        };

        Web.register(fakeServer, null, function() {
            done();
        });
    });

    it('returns the home view for non authenticaded users', function(done) {

        MockAuth.authenticate = false;
        Manager.start(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exist();

            server.inject(Config.prefixes.home, function(response) {

                MockAuth.authenticate = true;
                expect(response.statusCode).to.equal(200);
                expect(response.result).to.be.a.string();
                expect(response.request.auth.isAuthenticated).to.be.false();
                Manager.stop(done);
            });
        });
    });

    it('returns the home view for authenticaded users', function(done) {

        Manager.start(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exist();

            server.inject({
                method: 'GET',
                url: Config.prefixes.home,
                credentials: internals.users[0]
            }, function(response) {

                expect(response.statusCode).to.equal(200);
                expect(response.result).to.be.a.string();
                expect(response.request.auth.isAuthenticated).to.be.true();
                expect(response.request.auth.credentials.id).to.equal(internals.users[0].id);
                expect(response.request.auth.credentials.username).to.equal(internals.users[0].username);
                expect(response.request.auth.credentials.email).to.equal(internals.users[0].email);
                expect(response.request.auth.credentials.scope).to.equal(internals.users[0].scope);
                Manager.stop(done);

            });

        });
    });

    it('returns the home view for admin users', function(done) {

        Manager.start(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exist();

            server.inject({
                method: 'GET',
                url: Config.prefixes.home,
                credentials: internals.users[1]
            }, function(response) {

                expect(response.statusCode).to.equal(200);
                expect(response.result).to.be.a.string();
                expect(response.request.auth.isAuthenticated).to.be.true();
                expect(response.request.auth.credentials.id).to.equal(internals.users[1].id);
                expect(response.request.auth.credentials.username).to.equal(internals.users[1].username);
                expect(response.request.auth.credentials.email).to.equal(internals.users[1].email);
                expect(response.request.auth.credentials.scope).to.equal(internals.users[1].scope);
                Manager.stop(done);
            });

        });
    });

    it('returns the login view', function(done) {

        Manager.start(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exist();

            server.inject(Config.prefixes.login, function(response) {

                expect(response.statusCode).to.equal(200);
                expect(response.result).to.be.a.string();
                Manager.stop(done);
            });

        });
    });

    it('returns the admin page', function(done) {

        var mockQuery = {
            count: function() {
                return {
                    then: function() {
                        return 4;
                    }
                };
            }
        };

        Manager.start(internals.manifest, internals.composeOptions, function(err, server) {

            Sinon.stub(Repository.user, 'query').returns(mockQuery);
            Sinon.stub(Repository.role, 'query').returns(mockQuery);
            Sinon.stub(Repository.resource, 'query').returns(mockQuery);

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

                Repository.user.query.restore();
                Repository.role.query.restore();
                Repository.resource.query.restore();
                Manager.stop(done);
            });

        });
    });

    it('returns the user account page', function(done) {

        var findByIdStub = Sinon.stub(UserService, 'findById');
        findByIdStub.withArgs(internals.users[0].id).returns(Promise.resolve(internals.users[0]));

        Manager.start(internals.manifest, internals.composeOptions, function(err, server) {

            expect(err).to.not.exist();
            server.inject({
                method: 'GET',
                url: Config.prefixes.profile,
                credentials: {
                    id: internals.users[0].id,
                    scope: 'user'
                }
            }, function(response) {

                expect(response.statusCode).to.equal(200);
                expect(response.result).to.be.a.string();

                findByIdStub.restore();
                Manager.stop(done);
            });

        });
    });
});
