var Code = require('code');
var Lab = require('lab');
var Knex = require('knex');
var Objection = require('objection');
var KnexConfig = require('../../knexfile');
var Repository = require('../../lib/plugins/repository');
var AuthorizationService = require('../../lib/services/authorization');
var HSError = require('../../lib/error');

var lab = exports.lab = Lab.script(); // export the test script

// make lab feel like jasmine
var describe = lab.experiment;
var it = lab.test;
var beforeEach = lab.beforeEach;
var expect = Code.expect;

describe('Service: authorization', function() {

    var knex;

    beforeEach(function(done) {

        var options = {
            models: ['user', 'role', 'resource', 'permission']
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

    it('can authorize a role with the right permissions', function(done) {

        AuthorizationService.canRole('admin', 'read', 'user').then(function(result) {

            expect(result).to.be.true();
            done();
        });
    });

    it('can not authorize a role with the wrong permissions', function(done) {

        AuthorizationService.canRole('user', 'create', 'user').then(function(result) {

            expect(result).to.be.false();
            done();
        });
    });

    it('can not authorize a role with no permissions', function(done) {

        AuthorizationService.canRole('guest', 'read', 'role').then(function(result) {

            expect(result).to.be.false();
            done();
        });
    });

    it('can not authorize a role for an invalid action', function(done) {

        AuthorizationService.canRole('guest', 'invalid action', 'role').then(function(result) {

            expect(result).to.be.false();
            done();
        });
    });

    it('handles authorization for a non existing role', function(done) {

        AuthorizationService.canRole('invalid role', 'read', 'role').then(function(result) {

            expect(result).to.not.exist();
        }).catch(function(error) {

            expect(error).to.equals(HSError.RESOURCE_NOT_FOUND);
            done();
        });
    });

    it('handles authorization for a non existing resource', function(done) {

        AuthorizationService.canRole('guest', 'read', 'invalid resource').then(function(result) {

            expect(result).to.not.exist();
        }).catch(function(error) {

            expect(error).to.equals(HSError.RESOURCE_NOT_FOUND);
            done();
        });
    });

    it('can authorize a user that has a role with the right permissions', function(done) {

        AuthorizationService.canUser('admin', 'create', 'user').then(function(result) {

            expect(result).to.be.true();
            done();
        });
    });

    it('can authorize a user that has multiple roles with the right permissions', function(done) {

        AuthorizationService.canUser('admin', 'read', 'role').then(function(result) {

            expect(result).to.be.true();
            done();
        });
    });

    it('can not authorize a user that has no roles with the right permissions', function(done) {

        AuthorizationService.canUser('test', 'create', 'user').then(function(result) {

            expect(result).to.be.false();
            done();
        });
    });

    it('can not authorize a user that has no roles', function(done) {

        AuthorizationService.canUser('noroles', 'read', 'role').then(function(result) {

            expect(result).to.be.false();
            done();
        });
    });

    it('handles authorization for a non existing user', function(done) {

        AuthorizationService.canUser('invalid user', 'read', 'role').then(function(result) {

            expect(result).to.not.exists();
        }).catch(function(error) {

            expect(error).to.equals(HSError.RESOURCE_NOT_FOUND);
            done();
        });
    });
});
