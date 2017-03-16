'use strict';

var Code = require('code');
var Lab = require('lab');
var Knex = require('knex');
var Sinon = require('sinon');
var Objection = require('objection');
var KnexConfig = require('../../knexfile');
var ResourceService = require('../../lib/services/resource');
var Repository = require('../../lib/plugins/repository');
var ResourceModel = require('../../lib/models/resource');
var HSError = require('../../lib/error');

var lab = exports.lab = Lab.script(); // export the test script

// make lab feel like jasmine
var describe = lab.experiment;
var it = lab.test;
var beforeEach = lab.beforeEach;
var expect = Code.expect;

describe('Service: resource', function() {

    var knex;

    beforeEach(function(done) {

        var options = {
            models: ['resource', 'permission']
        };

        var fakeServer = {
            log: function() {},
            decorate: function() {}
        };

        /*jshint -W064 */
        knex = Knex(KnexConfig.testing); // eslint-disable-line
        /*jshint -W064 */

        knex.migrate.latest().then(function() {

            return knex.seed.run();

        }).then(function() {

            Objection.Model.knex(knex);
            Repository.register(fakeServer, options, function() {

                done();
            });
        });
    });

    it('lists resources', function(done) {

        ResourceService.list().then(function(results) {

            expect(results).to.be.an.array();
            expect(results.length).to.equals(4);
            results.forEach(function(resource) {
                expect(resource).to.be.instanceof(ResourceModel);
                expect(resource.id).to.exists();
                expect(resource.name).to.be.a.string();
            });
            done();
        });
    });

    it('fetch valid resource by id', function(done) {

        ResourceService.findById(1).then(function(result) {
            expect(result).to.be.an.object();
            expect(result).to.be.instanceof(ResourceModel);
            expect(result.id).to.equals(1);
            expect(result.name).to.equals('user');
            done();
        });
    });

    it('fetch invalid resource by id', function(done) {

        ResourceService.findById(999).then(function(result) {

            expect(result).to.not.exist();
        }).catch(function(error) {

            expect(error).to.equals(HSError.RESOURCE_NOT_FOUND);
            done();
        });
    });

    it('fetch valid resource by name', function(done) {

        ResourceService.findByName('user').then(function(results) {
            expect(results).to.be.an.array();
            expect(results.length).to.equals(1);
            expect(results[0]).to.be.instanceof(ResourceModel);
            expect(results[0].id).to.equals(1);
            expect(results[0].name).to.equals('user');
            done();
        });
    });

    it('fetch invalid resource by name', function(done) {

        ResourceService.findByName('invalid resource name').then(function(result) {

            expect(result).to.be.an.array();
            expect(result).to.be.empty();
            done();
        });
    });

    it('adds a new resource', function(done) {

        var resource = {
            id: 10,
            name: 'newresource'
        };

        var txSpy = Sinon.spy(Repository, 'tx');

        ResourceService.add(resource).then(function(result) {

            expect(txSpy.calledOnce).to.be.true();
            expect(txSpy.args[0].length).to.equals(2);
            expect(txSpy.args[0][0]).to.equals(ResourceModel);
            expect(result).to.be.an.instanceof(ResourceModel);
            expect(result.id).to.equals(resource.id);
            expect(result.name).to.equals(resource.name);
            txSpy.restore();
            done();
        });
    });

    it('does not add an existing resource', function(done) {

        var resource = {
            name: 'user'
        };

        var txSpy = Sinon.spy(Repository, 'tx');
        ResourceService.add(resource).then(function(result) {

            expect(result).to.not.exists();

        }).catch(function(error) {

            expect(txSpy.calledOnce).to.be.true();
            expect(error).to.equals(HSError.RESOURCE_DUPLICATE);
            txSpy.restore();
            done();
        });
    });

    it('deletes an existing resource', function(done) {

        var txSpy = Sinon.spy(Repository, 'tx');
        ResourceService.delete(3).then(function(result) {

            expect(txSpy.calledOnce).to.be.true();
            expect(result).to.not.exists();
            txSpy.restore();
            done();
        });
    });

    it('does not delete a non existing resource', function(done) {

        var txSpy = Sinon.spy(Repository, 'tx');
        ResourceService.delete(999).then(function(result) {

            expect(result).to.not.exists();

        }).catch(function(error) {

            expect(txSpy.calledOnce).to.be.true();
            expect(error).to.equals(HSError.RESOURCE_NOT_FOUND);
            txSpy.restore();
            done();
        });
    });

    it('does not delete a resource if permissions using it exist', function(done) {

        var txSpy = Sinon.spy(Repository, 'tx');
        ResourceService.delete(1).then(function(result) {

            expect(result).to.not.exists();

        }).catch(function(error) {

            expect(txSpy.calledOnce).to.be.true();
            expect(error).to.equals(HSError.RESOURCE_RELATION);
            txSpy.restore();
            done();
        });
    });

    it('updates an existing resource', function(done) {

        var resource = {
            id: 3,
            name: 'newname'
        };

        var txSpy = Sinon.spy(Repository, 'tx');
        ResourceService.update(resource.id, resource).then(function(result) {

            expect(txSpy.calledOnce).to.be.true();
            expect(result).to.be.an.instanceof(ResourceModel);
            expect(result.id).to.equals(resource.id);
            expect(result.name).to.equals(resource.name);
            txSpy.restore();
            done();
        });
    });

    it('does not update a non existing resource', function(done) {

        var txSpy = Sinon.spy(Repository, 'tx');
        ResourceService.update(999, {
            name: 'non existing resource'
        }).then(function(result) {

            expect(result).to.not.exists();

        }).catch(function(error) {

            expect(txSpy.calledOnce).to.be.true();
            expect(error).to.equals(HSError.RESOURCE_NOT_FOUND);
            txSpy.restore();
            done();
        });
    });

    it('does not update a resource with same name as an existing resource', function(done) {

        var resource = {
            id: 3,
            name: 'user'
        };
        var txSpy = Sinon.spy(Repository, 'tx');
        ResourceService.update(resource.id, resource).then(function(result) {

            expect(result).to.not.exists();

        }).catch(function(error) {

            expect(txSpy.calledOnce).to.be.true();
            expect(error).to.equals(HSError.RESOURCE_DUPLICATE);
            txSpy.restore();
            done();
        });
    });

});
