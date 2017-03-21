'use strict';

var Promise = require('bluebird');
var Code = require('code'); // the assertions library
var Lab = require('lab'); // the test framework
var Sinon = require('sinon');
var RoleCtrl = require('../../../lib/controllers/api/role');
var RoleService = require('../../../lib/services/role');
var HSError = require('../../../lib/error');

var lab = exports.lab = Lab.script(); // export the test script

// make lab feel like jasmine
var describe = lab.experiment;
var it = lab.test;
var expect = Code.expect;

var internals = {};
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

describe('Controller: role', function() {

    it('lists available roles', function(done) {

        var request = {
            log: function() {}
        };

        var listStub = Sinon.stub(RoleService, 'list');
        listStub.returns(Promise.resolve(internals.roles));
        RoleCtrl.list(request, function(response) {

            expect(RoleService.list.calledOnce).to.be.true();
            expect(response).to.equals(internals.roles);

            listStub.restore();
            done();
        });
    });

    it('handles server errors while listing roles', function(done) {

        var request = {
            params: {
                id: 0
            },
            log: function() {}
        };

        var listStub = Sinon.stub(RoleService, 'list');
        listStub.returns(Promise.reject(HSError.RESOURCE_FETCH));

        RoleCtrl.list(request, function(response) {

            expect(RoleService.list.calledOnce).to.be.true();
            expect(response.isBoom).to.be.true();
            expect(response.output.statusCode).to.equals(500);
            expect(response.output.payload.error).to.equals('Internal Server Error');
            expect(response.output.payload.message).to.equals('An internal server error occurred');

            listStub.restore();
            done();
        });
    });

    it('gets a specific role', function(done) {

        var request = {
            params: {
                id: 0
            },
            log: function() {}
        };

        var findByIdStub = Sinon.stub(RoleService, 'findById');
        findByIdStub.withArgs(request.params.id).returns(Promise.resolve(internals.roles[request.params.id]));

        RoleCtrl.get(request, function(response) {

            expect(RoleService.findById.calledOnce).to.be.true();
            expect(response).to.equals(internals.roles[request.params.id]);

            findByIdStub.restore();
            done();
        });
    });

    it('get of a non existing role', function(done) {

        var request = {
            params: {
                id: 2
            },
            log: function() {}
        };

        var findByIdStub = Sinon.stub(RoleService, 'findById');
        findByIdStub.withArgs(request.params.id).returns(Promise.reject(HSError.RESOURCE_NOT_FOUND));

        RoleCtrl.get(request, function(response) {

            expect(RoleService.findById.calledOnce).to.be.true();
            expect(response.isBoom).to.be.true();
            expect(response.output.statusCode).to.equals(404);
            expect(response.output.payload.error).to.equals('Not Found');
            expect(response.output.payload.message).to.equals(HSError.RESOURCE_NOT_FOUND);

            findByIdStub.restore();
            done();
        });
    });

    it('handles server errors while getting a role', function(done) {

        var request = {
            params: {
                id: 0
            },
            log: function() {}
        };

        var findByIdStub = Sinon.stub(RoleService, 'findById');
        findByIdStub.withArgs(request.params.id).returns(Promise.reject(HSError.RESOURCE_FETCH));

        RoleCtrl.get(request, function(response) {

            expect(RoleService.findById.calledOnce).to.be.true();
            expect(response.isBoom).to.be.true();
            expect(response.output.statusCode).to.equals(500);
            expect(response.output.payload.error).to.equals('Internal Server Error');
            expect(response.output.payload.message).to.equals('An internal server error occurred');

            findByIdStub.restore();
            done();
        });
    });

    it('creates a new role', function(done) {

        var request = {
            payload: {
                name: 'newrole'
            },
            log: function() {},
        };

        var addStub = Sinon.stub(RoleService, 'add');
        addStub.withArgs(request.payload).returns(Promise.resolve({
            id: '2',
            name: request.payload.name
        }));

        RoleCtrl.create(request, function(response) {

            expect(RoleService.add.calledOnce).to.be.true();
            expect(response.name).to.equals(request.payload.name);

            addStub.restore();

            return {
                created: function(path) {

                    expect(path).to.equals('/role/' + response.id);
                    done();
                }
            };
        });
    });

    it('handles creating a role that already exists', function(done) {

        var request = {
            payload: {
                name: 'admin'
            },
            log: function() {},
        };

        var addStub = Sinon.stub(RoleService, 'add');
        addStub.withArgs(request.payload).returns(Promise.reject(HSError.RESOURCE_DUPLICATE));

        RoleCtrl.create(request, function(response) {

            expect(RoleService.add.calledOnce).to.be.true();
            expect(response.isBoom).to.be.true();
            expect(response.output.statusCode).to.equals(409);
            expect(response.output.payload.error).to.equals('Conflict');
            expect(response.output.payload.message).to.equals(HSError.RESOURCE_DUPLICATE);

            addStub.restore();
            done();
        });
    });

    it('handles server errors while creating a role', function(done) {

        var request = {
            payload: {
                name: 'newrole'
            },
            log: function() {},
        };

        var addStub = Sinon.stub(RoleService, 'add');
        addStub.withArgs(request.payload).returns(Promise.reject(HSError.RESOURCE_INSERT));

        RoleCtrl.create(request, function(response) {

            expect(RoleService.add.calledOnce).to.be.true();
            expect(response.isBoom).to.be.true();
            expect(response.output.statusCode).to.equals(500);
            expect(response.output.payload.error).to.equals('Internal Server Error');
            expect(response.output.payload.message).to.equals('An internal server error occurred');

            addStub.restore();
            done();
        });
    });

    it('deletes an existing role', function(done) {

        var request = {
            params: {
                id: 0
            },
            log: function() {}
        };

        var deleteStub = Sinon.stub(RoleService, 'delete');
        deleteStub.withArgs(request.params.id).returns(Promise.resolve());

        RoleCtrl.delete(request, function(response) {

            expect(RoleService.delete.calledOnce).to.be.true();
            expect(response).to.not.exist();

            deleteStub.restore();
            done();
        });
    });

    it('handles deleting a role that does not exist', function(done) {

        var request = {
            params: {
                id: 2
            },
            log: function() {}
        };

        var deleteStub = Sinon.stub(RoleService, 'delete');
        deleteStub.withArgs(request.params.id).returns(Promise.reject(HSError.RESOURCE_NOT_FOUND));

        RoleCtrl.delete(request, function(response) {

            expect(RoleService.delete.calledOnce).to.be.true();
            expect(response.isBoom).to.be.true();
            expect(response.output.statusCode).to.equals(404);
            expect(response.output.payload.error).to.equals('Not Found');
            expect(response.output.payload.message).to.equals(HSError.RESOURCE_NOT_FOUND);

            deleteStub.restore();
            done();
        });
    });

    it('handles deleting a role that is assigned to a user', function(done) {

        var request = {
            params: {
                id: 1
            },
            log: function() {}
        };

        var deleteStub = Sinon.stub(RoleService, 'delete');
        deleteStub.withArgs(request.params.id).returns(Promise.reject(HSError.RESOURCE_RELATION));

        RoleCtrl.delete(request, function(response) {

            expect(RoleService.delete.calledOnce).to.be.true();
            expect(response.isBoom).to.be.true();
            expect(response.output.statusCode).to.equals(409);
            expect(response.output.payload.error).to.equals('Conflict');
            expect(response.output.payload.message).to.equals(HSError.RESOURCE_RELATION);

            deleteStub.restore();
            done();
        });
    });

    it('handles server errors while deleting a role', function(done) {

        var request = {
            params: {
                id: 1
            },
            log: function() {}
        };

        var deleteStub = Sinon.stub(RoleService, 'delete');
        deleteStub.withArgs(request.params.id).returns(Promise.reject(HSError.RESOURCE_DELETE));

        RoleCtrl.delete(request, function(response) {

            expect(RoleService.delete.calledOnce).to.be.true();
            expect(response.isBoom).to.be.true();
            expect(response.output.statusCode).to.equals(500);
            expect(response.output.payload.error).to.equals('Internal Server Error');
            expect(response.output.payload.message).to.equals('An internal server error occurred');

            deleteStub.restore();
            done();
        });
    });

    it('updates a role', function(done) {

        var request = {
            params: {
                id: 0
            },
            payload: {
                name: 'updatedRole'
            },
            log: function() {}
        };

        var updateStub = Sinon.stub(RoleService, 'update');
        updateStub.withArgs(request.params.id, request.payload).returns(Promise.resolve({
            id: request.params.id,
            name: request.payload.name
        }));

        RoleCtrl.update(request, function(response) {

            expect(RoleService.update.calledOnce).to.be.true();
            expect(response.id).to.equals(request.params.id);
            expect(response.name).to.equals(request.payload.name);

            updateStub.restore();
            done();
        });
    });

    it('updates a role that does not exit', function(done) {

        var request = {
            params: {
                id: 2
            },
            payload: {
                name: 'updatedRole'
            },
            log: function() {}
        };

        var updateStub = Sinon.stub(RoleService, 'update');
        updateStub.withArgs(request.params.id, request.payload).returns(Promise.reject(HSError.RESOURCE_NOT_FOUND));

        RoleCtrl.update(request, function(response) {

            expect(RoleService.update.calledOnce).to.be.true();
            expect(response.isBoom).to.be.true();
            expect(response.output.statusCode).to.equals(404);
            expect(response.output.payload.error).to.equals('Not Found');
            expect(response.output.payload.message).to.equals(HSError.RESOURCE_NOT_FOUND);

            updateStub.restore();
            done();
        });
    });

    it('updates a role when a duplicate exists', function(done) {

        var request = {
            params: {
                id: 1
            },
            payload: {
                name: 'updatedRole'
            },
            log: function() {}
        };

        var updateStub = Sinon.stub(RoleService, 'update');
        updateStub.withArgs(request.params.id, request.payload).returns(Promise.reject(HSError.RESOURCE_DUPLICATE));

        RoleCtrl.update(request, function(response) {

            expect(RoleService.update.calledOnce).to.be.true();
            expect(response.isBoom).to.be.true();
            expect(response.output.statusCode).to.equals(409);
            expect(response.output.payload.error).to.equals('Conflict');
            expect(response.output.payload.message).to.equals(HSError.RESOURCE_DUPLICATE);

            updateStub.restore();
            done();
        });
    });

    it('handles server errors while updating a role', function(done) {

        var request = {
            params: {
                id: 1
            },
            payload: {
                name: 'updatedRole'
            },
            log: function() {}
        };

        var updateStub = Sinon.stub(RoleService, 'update');
        updateStub.withArgs(request.params.id, request.payload).returns(Promise.reject(HSError.RESOURCE_UPDATE));

        RoleCtrl.update(request, function(response) {

            expect(RoleService.update.calledOnce).to.be.true();
            expect(response.isBoom).to.be.true();
            expect(response.output.statusCode).to.equals(500);
            expect(response.output.payload.error).to.equals('Internal Server Error');
            expect(response.output.payload.message).to.equals('An internal server error occurred');

            updateStub.restore();
            done();
        });
    });

    it('adds a user to an existing role', function(done) {

        var request = {
            params: {
                id: 0
            },
            payload: {
                id: 1
            },
            log: function() {}
        };

        var addUsersStub = Sinon.stub(RoleService, 'addUsers');
        addUsersStub.withArgs(request.params.id, request.payload.id).returns(Promise.resolve(request.payload.id));

        RoleCtrl.addUsers(request, function(response) {

            expect(RoleService.addUsers.calledOnce).to.be.true();
            expect(response).to.equals(request.payload.id);

            addUsersStub.restore();
            done();
        });
    });

    it('handles adding a user that does not exists or to a non existing role', function(done) {

        var request = {
            params: {
                id: 2
            },
            payload: {
                id: 1
            },
            log: function() {}
        };

        var addUsersStub = Sinon.stub(RoleService, 'addUsers');
        addUsersStub.withArgs(request.params.id, request.payload.id).returns(Promise.reject(HSError.RESOURCE_NOT_FOUND));

        RoleCtrl.addUsers(request, function(response) {

            expect(RoleService.addUsers.calledOnce).to.be.true();
            expect(response.isBoom).to.be.true();
            expect(response.output.statusCode).to.equals(404);
            expect(response.output.payload.error).to.equals('Not Found');
            expect(response.output.payload.message).to.equals(HSError.RESOURCE_NOT_FOUND);

            addUsersStub.restore();
            done();
        });
    });

    it('handles adding a user to a role that already contains it', function(done) {

        var request = {
            params: {
                id: 1
            },
            payload: {
                id: 1
            },
            log: function() {}
        };

        var addUsersStub = Sinon.stub(RoleService, 'addUsers');
        addUsersStub.withArgs(request.params.id, request.payload.id).returns(Promise.reject(HSError.RESOURCE_DUPLICATE));

        RoleCtrl.addUsers(request, function(response) {

            expect(RoleService.addUsers.calledOnce).to.be.true();
            expect(response.isBoom).to.be.true();
            expect(response.output.statusCode).to.equals(409);
            expect(response.output.payload.error).to.equals('Conflict');
            expect(response.output.payload.message).to.equals(HSError.RESOURCE_DUPLICATE);

            addUsersStub.restore();
            done();
        });
    });

    it('handles server error while adding a user to a role', function(done) {

        var request = {
            params: {
                id: 0
            },
            payload: {
                id: 1
            },
            log: function() {}
        };

        var addUsersStub = Sinon.stub(RoleService, 'addUsers');
        addUsersStub.withArgs(request.params.id, request.payload.id).returns(Promise.reject(HSError.RESOURCE_UPDATE));

        RoleCtrl.addUsers(request, function(response) {

            expect(RoleService.addUsers.calledOnce).to.be.true();
            expect(response.isBoom).to.be.true();
            expect(response.output.statusCode).to.equals(500);
            expect(response.output.payload.error).to.equals('Internal Server Error');
            expect(response.output.payload.message).to.equals('An internal server error occurred');

            addUsersStub.restore();
            done();
        });
    });

    it('removes a user from an existing role', function(done) {

        var request = {
            params: {
                id: 3
            },
            payload: {
                id: 1
            },
            log: function() {}
        };

        var removeUsersStub = Sinon.stub(RoleService, 'removeUsers');
        removeUsersStub.withArgs(request.params.id, request.payload.id).returns(Promise.resolve());

        RoleCtrl.removeUsers(request, function(response) {

            expect(RoleService.removeUsers.calledOnce).to.be.true();
            expect(response).to.not.exist();

            return {
                code: function() {
                    removeUsersStub.restore();
                    done();
                }
            };
        });
    });

    it('handles removing a non existing user or from non existing role', function(done) {

        var request = {
            params: {
                id: 8
            },
            payload: {
                id: 8
            },
            log: function() {}
        };

        var removeUsersStub = Sinon.stub(RoleService, 'removeUsers');
        removeUsersStub.withArgs(request.params.id, request.payload.id).returns(Promise.reject(HSError.RESOURCE_NOT_FOUND));

        RoleCtrl.removeUsers(request, function(response) {

            expect(RoleService.removeUsers.calledOnce).to.be.true();
            expect(response.isBoom).to.be.true();
            expect(response.output.statusCode).to.equals(404);
            expect(response.output.payload.error).to.equals('Not Found');
            expect(response.output.payload.message).to.equals(HSError.RESOURCE_NOT_FOUND);

            removeUsersStub.restore();
            done();
        });
    });

    it('handles server error while removing user from role', function(done) {

        var request = {
            params: {
                id: 0
            },
            payload: {
                id: 1
            },
            log: function() {}
        };

        var removeUsersStub = Sinon.stub(RoleService, 'removeUsers');
        removeUsersStub.withArgs(request.params.id, request.payload.id).returns(Promise.reject(HSError.RESOURCE_UPDATE));

        RoleCtrl.removeUsers(request, function(response) {

            expect(RoleService.removeUsers.calledOnce).to.be.true();
            expect(response.isBoom).to.be.true();
            expect(response.output.statusCode).to.equals(500);
            expect(response.output.payload.error).to.equals('Internal Server Error');
            expect(response.output.payload.message).to.equals('An internal server error occurred');

            removeUsersStub.restore();
            done();
        });
    });

    it('removes a permission from an existing role', function(done) {

        var request = {
            params: {
                id: 1
            },
            payload: {
                id: 1
            },
            log: function() {}
        };

        var removePermissionStub = Sinon.stub(RoleService, 'removePermission');
        removePermissionStub.withArgs(request.params.id, request.payload.id).returns(Promise.resolve());

        RoleCtrl.removePermission(request, function(response) {

            expect(RoleService.removePermission.calledOnce).to.be.true();
            expect(response).to.not.exist();
            return {
                code: function() {
                    removePermissionStub.restore();
                    done();
                }
            };
        });
    });

    it('handles removing a non existing permission or from a non existing role', function(done) {

        var request= {
            params: {
                id: 99
            },
            payload: {
                id: 99
            },
            log: function() {}
        };

        var removePermissionStub = Sinon.stub(RoleService, 'removePermission');
        removePermissionStub.withArgs(request.params.id, request.payload.id). returns(Promise.reject(HSError.RESOURCE_NOT_FOUND));

        RoleCtrl.removePermission(request, function(response) {

            expect(RoleService.removePermission.calledOnce).to.be.true();
            expect(response.isBoom).to.be.true();
            expect(response.output.statusCode).to.equals(404);
            expect(response.output.payload.error).to.equals('Not Found');
            expect(response.output.payload.message).to.equals(HSError.RESOURCE_NOT_FOUND);

            removePermissionStub.restore();
            done();
        });
    });

    it('handles a server error while removing permission from role', function(done) {

        var request = {
            params: {
                id: 0
            },
            payload: {
                id: 1
            },
            log: function() {}
        };

        var removePermissionStub = Sinon.stub(RoleService, 'removePermission');
        removePermissionStub.withArgs(request.params.id, request.payload.id).returns(Promise.reject(HSError.RESOURCE_UPDATE));

        RoleCtrl.removePermission(request, function(response) {

            expect(RoleService.removePermission.calledOnce).to.be.true();
            expect(response.isBoom).to.be.true();
            expect(response.output.statusCode).to.equals(500);
            expect(response.output.payload.error).to.equals('Internal Server Error');
            expect(response.output.payload.message).to.equals('An internal server error occurred');

            removePermissionStub.restore();
            done();
        });
    });
});
