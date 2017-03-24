var Code = require('code'); // the assertions library
var Lab = require('lab'); // the test framework
var HomeCtrl = require('../../../lib/controllers/web/home');
var Package = require('../../../package.json');

var lab = exports.lab = Lab.script(); // export the test script

// make lab feel like jasmine
var describe = lab.experiment;
var it = lab.test;
var expect = Code.expect;

describe('Web Controller: home', function() {

    it('gets the home page for non authenticated users', function(done) {

        var request = {
            auth: {},
            params: {},
            log: function() {}
        };

        var reply = function() {};
        reply.view = function(page, context) {
            expect(page).to.equals('pages/home');
            expect(context.version).to.equals(Package.version);
            expect(context.user).to.not.exists();
            done();
        };

        HomeCtrl.get(request, reply);
    });

    it('gets the home page for authenticated users', function(done) {

        var request = {
            auth: {
                isAuthenticated: true,
                credentials: {
                    scope: 'user'
                }
            },
            params: {},
            log: function() {}
        };

        var reply = function() {};
        reply.view = function(page, context) {
            expect(page).to.equals('pages/home');
            expect(context.version).to.equals(Package.version);
            expect(context.user).to.equals(request.auth.credentials);
            expect(context.user.admin).to.satisfy(function(value) {
                return !value;
            });
            done();
        };

        HomeCtrl.get(request, reply);
    });

    it('gets the home page for admin users', function(done) {

        var request = {
            auth: {
                isAuthenticated: true,
                credentials: {
                    scope: 'admin'
                }
            },
            params: {},
            log: function() {}
        };

        var reply = function() {};
        reply.view = function(page, context) {
            expect(page).to.equals('pages/home');
            expect(context.version).to.equals(Package.version);
            expect(context.user).to.equals(request.auth.credentials);
            expect(context.user.admin).to.be.true();
            done();
        };

        HomeCtrl.get(request, reply);
    });

});
