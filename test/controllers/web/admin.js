var Promise = require('bluebird');
var Code = require('code'); // the assertions library
var Lab = require('lab'); // the test framework
var Sinon = require('sinon');
var AdminCtrl = require('../../../lib/controllers/web/admin');
var UserService = require('../../../lib/services/user');
var RoleService = require('../../../lib/services/role');
var ResourceService = require('../../../lib/services/resource');

var lab = exports.lab = Lab.script(); // export the test script

// make lab feel like jasmine
var describe = lab.experiment;
var it = lab.test;
var expect = Code.expect;

var internals = {};

internals.users = [{
    'id': 0,
    'username': 'test',
    'email': 'test@gmail.com'
}, {
    'id': 1,
    'username': 'admin',
    'email': 'admin@gmail.com'
}];

internals.roles = [{
    id: 0,
    name: 'admin'
}, {
    id: 1,
    name: 'user',
    users: [{
        id: 1
    }]
}];

describe('Web Controller: admin', function() {

    it('gets the main admin page', function(done) {

        var request = {
            auth: {
                credentials: {
                    id: 0
                }
            },
            params: {},
            log: function() {}
        };

        var userCount = 2;
        var roleCount = 3;
        var resourceCount = 4;

        var countUsers = Sinon.stub(UserService, 'count').returns(userCount);
        var countRoles = Sinon.stub(RoleService, 'count').returns(roleCount);
        var countResources = Sinon.stub(ResourceService, 'count').returns(resourceCount);

        var reply = function() {};
        reply.view = function(page, context) {
            expect(context.user.id).to.equals(request.auth.credentials.id);
            expect(page).to.equals('pages/admin');
            expect(UserService.count.calledOnce).to.be.true();
            expect(RoleService.count.calledOnce).to.be.true();
            expect(ResourceService.count.calledOnce).to.be.true();
            expect(context.count.users).to.equals(userCount);
            expect(context.count.roles).to.equals(roleCount);
            expect(context.count.resources).to.equals(resourceCount);
            expect(context.getAdminPartial()).to.equals('admin-main');
            countUsers.restore();
            countRoles.restore();
            countResources.restore();
            done();
        };

        AdminCtrl.get(request, reply);
    });

    it('handles errors getting the admin page', function(done) {

        var request = {
            params: {},
            log: function() {}
        };

        var countUsers = Sinon.stub(UserService, 'count').returns(Promise.reject('error'));
        var countRoles = Sinon.stub(RoleService, 'count').returns(1);
        var countResources = Sinon.stub(ResourceService, 'count').returns(1);

        AdminCtrl.get(request, function(response) {

            expect(response.isBoom).to.be.true();
            expect(response.output.statusCode).to.equals(500);
            expect(response.output.payload.error).to.equals('Internal Server Error');
            expect(response.output.payload.message).to.equals('An internal server error occurred');

            countUsers.restore();
            countRoles.restore();
            countResources.restore();
            done();
        });
    });

    it('gets the users admin page', function(done) {

        var request = {
            auth: {
                credentials: {
                    id: 0
                }
            },
            params: {
                partial: 'users'
            },
            log: function() {}
        };

        var listUsers = Sinon.stub(UserService, 'list').returns(Promise.resolve(internals.users));

        var reply = function() {};
        reply.view = function(page, context) {
            expect(context.user.id).to.equals(request.auth.credentials.id);
            expect(page).to.equals('pages/admin');
            expect(UserService.list.calledOnce).to.be.true();
            expect(context.users).to.equals(internals.users);
            expect(context.getAdminPartial()).to.equals('admin-users');
            listUsers.restore();
            done();
        };

        AdminCtrl.get(request, reply);
    });

    it('handles errors getting the users admin page', function(done) {

        var request = {
            params: {
                partial: 'users'
            },
            log: function() {}
        };

        var listUsers = Sinon.stub(UserService, 'list').returns(Promise.reject('error'));

        AdminCtrl.get(request, function(response) {

            expect(response.isBoom).to.be.true();
            expect(response.output.statusCode).to.equals(500);
            expect(response.output.payload.error).to.equals('Internal Server Error');
            expect(response.output.payload.message).to.equals('An internal server error occurred');

            listUsers.restore();
            done();
        });
    });

    it('gets the roles admin page', function(done) {

        var request = {
            auth: {
                credentials: {
                    id: 0
                }
            },
            params: {
                partial: 'roles'
            },
            log: function() {}
        };

        var listRoles = Sinon.stub(RoleService, 'list').returns(Promise.resolve(internals.roles));

        var reply = function() {};
        reply.view = function(page, context) {
            expect(context.user.id).to.equals(request.auth.credentials.id);
            expect(page).to.equals('pages/admin');
            expect(RoleService.list.calledOnce).to.be.true();
            expect(context.roles).to.equals(internals.roles);
            expect(context.getAdminPartial()).to.equals('admin-roles');
            listRoles.restore();
            done();
        };

        AdminCtrl.get(request, reply);
    });

    it('handles errors getting the roles admin page', function(done) {

        var request = {
            params: {
                partial: 'roles'
            },
            log: function() {}
        };

        var listRoles = Sinon.stub(RoleService, 'list').returns(Promise.reject('error'));

        AdminCtrl.get(request, function(response) {

            expect(response.isBoom).to.be.true();
            expect(response.output.statusCode).to.equals(500);
            expect(response.output.payload.error).to.equals('Internal Server Error');
            expect(response.output.payload.message).to.equals('An internal server error occurred');

            listRoles.restore();
            done();
        });
    });

});
