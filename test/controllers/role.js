'use strict';

var Promise = require('bluebird');
var Code = require('code'); // the assertions library
var Lab = require('lab'); // the test framework
var Sinon = require('sinon');
var RoleCtrl = require('../../lib/controllers/role');
var RoleService = require('../../lib/services/role');
var HSError = require('../../lib/error');

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

        var addUserStub = Sinon.stub(RoleService, 'addUser');
        addUserStub.withArgs(request.params.id, request.payload.id).returns(Promise.resolve(request.payload.id));

        RoleCtrl.addUser(request, function(response) {

            expect(RoleService.addUser.calledOnce).to.be.true();
            expect(response).to.equals(request.payload.id);

            addUserStub.restore();
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

        var addUserStub = Sinon.stub(RoleService, 'addUser');
        addUserStub.withArgs(request.params.id, request.payload.id).returns(Promise.reject(HSError.RESOURCE_NOT_FOUND));

        RoleCtrl.addUser(request, function(response) {

            expect(RoleService.addUser.calledOnce).to.be.true();
            expect(response.isBoom).to.be.true();
            expect(response.output.statusCode).to.equals(404);
            expect(response.output.payload.error).to.equals('Not Found');
            expect(response.output.payload.message).to.equals(HSError.RESOURCE_NOT_FOUND);

            addUserStub.restore();
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

        var addUserStub = Sinon.stub(RoleService, 'addUser');
        addUserStub.withArgs(request.params.id, request.payload.id).returns(Promise.reject(HSError.RESOURCE_DUPLICATE));

        RoleCtrl.addUser(request, function(response) {

            expect(RoleService.addUser.calledOnce).to.be.true();
            expect(response.isBoom).to.be.true();
            expect(response.output.statusCode).to.equals(409);
            expect(response.output.payload.error).to.equals('Conflict');
            expect(response.output.payload.message).to.equals(HSError.RESOURCE_DUPLICATE);

            addUserStub.restore();
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

        var addUserStub = Sinon.stub(RoleService, 'addUser');
        addUserStub.withArgs(request.params.id, request.payload.id).returns(Promise.reject(HSError.RESOURCE_UPDATE));

        RoleCtrl.addUser(request, function(response) {

            expect(RoleService.addUser.calledOnce).to.be.true();
            expect(response.isBoom).to.be.true();
            expect(response.output.statusCode).to.equals(500);
            expect(response.output.payload.error).to.equals('Internal Server Error');
            expect(response.output.payload.message).to.equals('An internal server error occurred');

            addUserStub.restore();
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

        var removeUserStub = Sinon.stub(RoleService, 'removeUser');
        removeUserStub.withArgs(request.params.id, request.payload.id).returns(Promise.resolve());

        RoleCtrl.removeUser(request, function(response) {

            expect(RoleService.removeUser.calledOnce).to.be.true();
            expect(response).to.not.exist();

            removeUserStub.restore();
            done();
        });
    });

    it('handles removing a user that does not exist or to a non existing role', function(done) {

        var request = {
            params: {
                id: 8
            },
            payload: {
                id: 8
            },
            log: function() {}
        };

        var removeUserStub = Sinon.stub(RoleService, 'removeUser');
        removeUserStub.withArgs(request.params.id, request.payload.id).returns(Promise.reject(HSError.RESOURCE_NOT_FOUND));

        RoleCtrl.removeUser(request, function(response) {

            expect(RoleService.removeUser.calledOnce).to.be.true();
            expect(response.isBoom).to.be.true();
            expect(response.output.statusCode).to.equals(404);
            expect(response.output.payload.error).to.equals('Not Found');
            expect(response.output.payload.message).to.equals(HSError.RESOURCE_NOT_FOUND);

            removeUserStub.restore();
            done();
        });
    });

    it('handles removing a user from a role that does not has it', function(done) {
        var request = {
            params: {
                id: 2
            },
            payload: {
                id: 3
            },
            log: function() {}
        };

        var removeUserStub = Sinon.stub(RoleService, 'removeUser');
        removeUserStub.withArgs(request.params.id, request.payload.id).returns(Promise.reject(HSError.RESOURCE_NOT_FOUND));

        RoleCtrl.removeUser(request, function(response) {

            expect(RoleService.removeUser.calledOnce).to.be.true();
            expect(response.isBoom).to.be.true();
            expect(response.output.statusCode).to.equals(404);
            expect(response.output.payload.error).to.equals('Not Found');
            expect(response.output.payload.message).to.equals(HSError.RESOURCE_NOT_FOUND);

            removeUserStub.restore();
            done();
        });
    });



});
