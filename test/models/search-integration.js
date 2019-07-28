const Lab = require('@hapi/lab');
const Knex = require('knex');
const KnexConfig = require('knexfile');
const Objection = require('objection');
const SearchQueryBuilder = require('models/search');

const { beforeEach, before, describe, expect, it } = (exports.lab = Lab.script());

describe('Integration: search', () => {
    let roleModel;
    let permissionModel;
    let resourceModel;

    beforeEach(async () => {
        const knex = Knex(KnexConfig.testing);
        await knex.migrate.latest();
        await knex.seed.run();

        Objection.Model.knex(knex);
    });

    before(() => {
        roleModel = class extends Objection.Model {};
        roleModel.QueryBuilder = SearchQueryBuilder;
        roleModel.tableName = 'roles';
        roleModel.searchFields = ['name'];

        resourceModel = class extends Objection.Model {};
        resourceModel.QueryBuilder = SearchQueryBuilder;
        resourceModel.tableName = 'resources';
        resourceModel.searchFields = ['name'];

        permissionModel = class extends Objection.Model {};
        permissionModel.QueryBuilder = SearchQueryBuilder;
        permissionModel.tableName = 'permissions';
        permissionModel.searchFields = ['action'];
        permissionModel.relationMappings = {
            resource: {
                relation: Objection.Model.HasOneRelation,
                modelClass: resourceModel,
                join: { from: 'permissions.resourceId', to: 'resources.id' }
            },
            roles: {
                relation: Objection.Model.ManyToManyRelation,
                modelClass: roleModel,
                join: {
                    from: 'permissions.id',
                    through: {
                        from: 'roles_permissions.permissionId',
                        to: 'roles_permissions.roleId'
                    },
                    to: 'roles.id'
                }
            }
        };
    });

    it('lists permissions', async () => {
        // setup
        const matchingIds = [...Array(10).keys()].map(value => value + 1); // id 1 to 10

        // exercise
        const result = await permissionModel.query();

        // verify
        expect(result.length).to.equal(matchingIds.length);
        result.forEach(permission => {
            expect(permission).to.be.instanceOf(permissionModel);
            expect(matchingIds).to.contain(permission.id);
        });
    });

    it('lists permissions with search criteria', async () => {
        // setup
        const matchingIds = [2, 6, 9, 14, 15, 19, 24, 25, 26]; // permission.action: 'read'
        const criteria = { search: 'read' };

        // exercise
        const result = await permissionModel.query().search(...Object.values(criteria));

        // verify
        //expect(result.length).to.equal(matchingIds.length);
        result.forEach(permission => {
            expect(permission).to.be.instanceOf(permissionModel);
            expect(matchingIds).to.contain(permission.id);
        });
    });

    it('lists permissions with search criteria and one non many-to-many relation', async () => {
        // setup
        const matchingIds = [1, 2, 3, 4]; // resource.name: 'user'
        const criteria = { search: 'user', relations: 'resource' };

        // exercise
        const result = await permissionModel.query().search(...Object.values(criteria));

        // verify
        expect(result.length).to.equal(matchingIds.length);
        result.forEach(permission => {
            expect(permission).to.be.instanceOf(permissionModel);
            expect(matchingIds).to.contain(permission.id);
        });
    });

    it('lists permissions with search criteria and one many-to-many relation', async () => {
        // setup
        const matchingIds = [6, 2, 3]; // role.name: 'user'
        const criteria = { search: 'user', relations: 'roles' };

        // exercise
        const result = await permissionModel.query().search(...Object.values(criteria));

        // verify
        expect(result.length).to.equal(matchingIds.length);
        result.forEach(permission => {
            expect(permission).to.be.instanceOf(permissionModel);
            expect(matchingIds).to.contain(permission.id);
        });
    });

    it('lists permissions with search criteria and multiple relations', async () => {
        // setup
        const matchingIds = [
            1,
            2,
            3,
            4, // resource.name: 'user
            6 // role.name: 'user'
        ];
        const criteria = { search: 'user', relations: ['resource', 'roles'] };

        // exercise
        const result = await permissionModel.query().search(...Object.values(criteria));

        // verify
        expect(result.length).to.equal(matchingIds.length);
        result.forEach(permission => {
            expect(permission).to.be.instanceOf(permissionModel);
            expect(matchingIds).to.contain(permission.id);
        });
    });

    it('lists permissions with action read', async () => {
        // setup
        const matchingIds = [2, 6, 9]; // permission.action: 'read'

        // exercise
        const result = await permissionModel.query().andWhere('action', 'read');

        // verify
        expect(result.length).to.equal(matchingIds.length);
        result.forEach(permission => {
            expect(permission).to.be.instanceOf(permissionModel);
            expect(matchingIds).to.contain(permission.id);
            expect(permission.action).to.equal('read');
        });
    });

    it('lists permissions with resourceId 1 with search criteria', async () => {
        // setup
        const matchingIds = [4];
        const criteria = { search: 'delete' };

        // exercise
        const result = await permissionModel
            .query()
            .andWhere('resourceId', 1)
            .search(...Object.values(criteria));

        // verify
        expect(result.length).to.equal(matchingIds.length);
        result.forEach(permission => {
            expect(permission).to.be.instanceOf(permissionModel);
            expect(matchingIds).to.contain(permission.id);
            expect(permission.resourceId).to.equal(1);
        });
    });

    it('lists permissions with action read with search criteria and one relation', async () => {
        // setup
        const matchingIds = [
            2, // role.name: 'user'
            6 // role.name: 'user'
        ];
        const criteria = { search: 'user', relations: 'roles' };

        // exercise
        const result = await permissionModel
            .query()
            .andWhere('action', 'read')
            .search(...Object.values(criteria));

        // verify
        expect(result.length).to.equal(matchingIds.length);
        result.forEach(permission => {
            expect(permission).to.be.instanceOf(permissionModel);
            expect(matchingIds).to.contain(permission.id);
            expect(permission.action).to.equal('read');
        });
    });

    it('lists permissions with action read or delete with search criteria and multiple relations', async () => {
        // setup
        const matchingIds = [
            2, // resource.name: 'user' role.name: 'user'
            4 // resource.name: 'user'
        ];
        const criteria = { search: 'user', relations: ['roles', 'resource'] };

        // exercise
        const result = await permissionModel
            .query()
            .whereIn('action', ['read', 'delete'])
            .search(...Object.values(criteria));

        // verify
        expect(result.length).to.equal(matchingIds.length);
        result.forEach(permission => {
            expect(permission).to.be.instanceOf(permissionModel);
            expect(matchingIds).to.contain(permission.id);
            expect(permission.action).to.satisfy(value => value === 'read' || value === 'delete');
        });
    });
});
