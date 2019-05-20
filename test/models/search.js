const Lab = require('lab');
const Sinon = require('sinon');
const SearchQueryBuilder = require('models/search');
const Objection = require('objection');

const { before, describe, expect, it } = (exports.lab = Lab.script());

describe('Model: search', function() {
    let baseModel;
    let OwnerClass;
    let RelatedClass;

    before(() => {
        const BaseModel = class extends Objection.Model {};
        BaseModel.QueryBuilder = SearchQueryBuilder;

        baseModel = new BaseModel();

        OwnerClass = class extends Objection.Model {};
        OwnerClass.QueryBuilder = SearchQueryBuilder;

        RelatedClass = class extends Objection.Model {};
        RelatedClass.QueryBuilder = SearchQueryBuilder;
    });

    it('returns the search query builder', () => {
        expect(baseModel.$query().search()).to.be.an.instanceof(SearchQueryBuilder);
    });

    it('does not add the search clause when no search fields are present', () => {
        // setup
        const queryBuilder = baseModel.$query();
        Sinon.spy(queryBuilder, 'orWhere');

        // exercise
        queryBuilder.search('something');

        // verify
        expect(queryBuilder.orWhere.notCalled).to.be.true();
    });

    it('adds the search clause for every search field present', () => {
        // setup
        const fakeSearch = 'something';
        const fakeFields = ['search1', 'search2', 'search3'];
        const model = new class extends Objection.Model {
            static get searchFields() {
                return fakeFields;
            }

            static get QueryBuilder() {
                return SearchQueryBuilder;
            }
        }();
        const queryBuilder = model.$query();
        Sinon.spy(queryBuilder, 'orWhere');

        // exercise
        queryBuilder.search(fakeSearch);

        // verify
        expect(queryBuilder.orWhere.callCount).to.equal(fakeFields.length);
        fakeFields.forEach(field => {
            expect(queryBuilder.orWhere.calledWith(field, 'like')).to.be.true();
        });
    });

    it('searches in a non many-to-many relation', async flags => {
        // cleanup
        flags.onCleanup = function() {
            OwnerClass.query.restore();
            OwnerClass.getRelations.restore();
            RelatedClass.query.restore();
        };

        // setup
        const criteria = 'something';
        const relationName = 'child';

        OwnerClass.searchFields = ['name'];
        OwnerClass.tableName = 'resources';
        RelatedClass.searchFields = ['action'];
        RelatedClass.tableName = 'permissions';

        const ownerQB = OwnerClass.query();
        const relatedQB = RelatedClass.query();

        const relation = {
            child: {
                ownerModelClass: OwnerClass,
                ownerProp: { _props: ['id'] },
                relatedModelClass: RelatedClass,
                relatedProp: { _props: ['resource_id'] }
            }
        };

        const relationStub = Sinon.stub(OwnerClass, 'getRelations').returns(relation);

        Sinon.stub(OwnerClass, 'query').returns(ownerQB);
        const ownerSearchSpy = Sinon.spy(ownerQB, 'search');
        const ownerOrWhereInSpy = Sinon.spy(ownerQB, 'orWhereIn');

        const relatedQueryStub = Sinon.stub(RelatedClass, 'query').returns(relatedQB);
        const relatedSearchSpy = Sinon.spy(relatedQB, 'search');
        const relatedSelectSpy = Sinon.spy(relatedQB, 'select');

        // exercise
        OwnerClass.query().search(criteria, relationName);

        // verify
        expect(relationStub.calledOnce).to.be.true();
        expect(ownerSearchSpy.calledTwice).to.be.true();
        // search owner model with criteria and relation name
        expect(ownerSearchSpy.args[0].length).to.equal(2);
        expect(ownerSearchSpy.args[0][0]).to.equal(criteria);
        expect(ownerSearchSpy.args[0][1]).to.equal(relationName);
        // result set or where id matches result set of related model query builder
        expect(ownerOrWhereInSpy.calledOnce).to.be.true();
        expect(ownerOrWhereInSpy.args[0][0]).to.equal(['id']);
        expect(ownerOrWhereInSpy.args[0][1]).to.instanceOf(relatedQB.constructor);
        expect(relatedQueryStub.calledOnce).to.be.true();
        // search related model with criteria
        expect(relatedSearchSpy.calledOnce).to.be.true();
        expect(relatedSearchSpy.args[0].length).to.equal(1);
        expect(relatedSearchSpy.args[0][0]).to.equal(criteria);
        // select related model foreign key to owner model
        expect(relatedSelectSpy.calledOnce).to.be.true();
        expect(relatedSelectSpy.args[0].length).to.equal(1);
        expect(relatedSelectSpy.args[0][0]).to.equal(['resource_id']);
        // search with criteria only
        expect(ownerSearchSpy.args[1].length).to.equal(1);
        expect(ownerSearchSpy.args[1][0]).to.equal(criteria);
    });

    it('searches in a many-to-many relation', async flags => {
        // cleanup
        flags.onCleanup = function() {
            OwnerClass.query.restore();
            OwnerClass.getRelations.restore();
            RelatedClass.query.restore();
        };

        // setup
        const joinModelClass = class extends Objection.Model {};
        joinModelClass.QueryBuilder = SearchQueryBuilder;

        const criteria = 'something';
        const relationName = 'child';

        OwnerClass.searchFields = ['name'];
        OwnerClass.tableName = 'roles';
        RelatedClass.searchFields = ['action'];
        RelatedClass.tableName = 'permissions';

        const ownerQB = OwnerClass.query();
        const relatedQB = RelatedClass.query();
        const joinQB = joinModelClass.query();

        const relation = {
            child: {
                joinModelClass,
                ownerModelClass: OwnerClass,
                ownerProp: { _props: ['id'] },
                joinTableOwnerProp: { _props: ['role_id'] },
                relatedModelClass: RelatedClass,
                relatedProp: { _props: ['id'] },
                joinTableRelatedProp: { _props: ['permission_id'] }
            }
        };

        Sinon.stub(joinModelClass, 'query').returns(joinQB);
        const joinWhereInSpy = Sinon.spy(joinQB, 'whereIn');
        const joinOrWhereInSpy = Sinon.spy(joinQB, 'orWhereIn');

        const relationStub = Sinon.stub(OwnerClass, 'getRelations').returns(relation);

        Sinon.stub(OwnerClass, 'query').returns(ownerQB);
        const ownerOrWhereInSpy = Sinon.spy(ownerQB, 'orWhereIn');
        const ownerSearchSpy = Sinon.spy(ownerQB, 'search');
        const ownerSelectSpy = Sinon.spy(ownerQB, 'select');

        Sinon.stub(RelatedClass, 'query').returns(relatedQB);
        const relatedSearchSpy = Sinon.spy(relatedQB, 'search');
        const relatedSelectSpy = Sinon.spy(relatedQB, 'select');

        // exercise
        OwnerClass.query().search(criteria, relationName);

        // verify
        expect(ownerSearchSpy.calledTwice).to.be.true();
        // search owner with criteria and relation name
        expect(ownerSearchSpy.args[0].length).to.equal(2);
        expect(ownerSearchSpy.args[0][0]).to.equal(criteria);
        expect(ownerSearchSpy.args[0][1]).to.equal(relationName);
        expect(relationStub.calledOnce).to.be.true();
        // result set or where owner id matches result set from join query builder
        expect(ownerOrWhereInSpy.calledOnce).to.be.true();
        expect(ownerOrWhereInSpy.args[0][0]).to.equal(['id']);
        expect(ownerOrWhereInSpy.args[0][1]).to.be.instanceOf(joinQB.constructor);
        // where foreign key referencing owner in result set of owner query builder
        expect(joinWhereInSpy.calledOnce).to.be.true();
        expect(joinWhereInSpy.args[0].length).to.equal(2);
        expect(joinWhereInSpy.args[0][0]).to.equal(['role_id']);
        expect(joinWhereInSpy.args[0][1]).to.be.instanceOf(ownerQB.constructor);
        // search owner and select primary key
        expect(ownerSearchSpy.args[1].length).to.equal(1);
        expect(ownerSearchSpy.args[1][0]).to.equal(criteria);
        expect(ownerSelectSpy.calledOnce).to.be.true();
        expect(ownerSelectSpy.args[0][0]).to.equal(['id']);
        // or where foreign key referencing related in result set of related query builder
        expect(joinOrWhereInSpy.calledOnce).to.be.true();
        expect(joinOrWhereInSpy.args[0][0]).to.equal(['permission_id']);
        expect(joinOrWhereInSpy.args[0][1]).to.be.instanceOf(relatedQB.constructor);
        // search related and select primary key
        expect(relatedSearchSpy.calledOnce).to.be.true();
        expect(relatedSearchSpy.args[0].length).to.equal(1);
        expect(relatedSearchSpy.args[0][0]).to.equal(criteria);
        expect(relatedSelectSpy.calledOnce).to.be.true();
        expect(relatedSelectSpy.args[0][0]).to.equal(['id']);
    });

    it('should throw error when searching in a non-existent relation', flags => {
        // cleanup
        flags.onCleanup = function() {
            OwnerClass.query.restore();
            OwnerClass.getRelations.restore();
        };

        // setup
        OwnerClass.searchFields = ['name'];
        OwnerClass.tableName = 'roles';

        const ownerQB = OwnerClass.query();
        Sinon.stub(OwnerClass, 'query').returns(ownerQB);
        const relationStub = Sinon.stub(OwnerClass, 'getRelations').returns({});
        const ownerSearchSpy = Sinon.spy(ownerQB, 'search');
        const ownerOrWhereInSpy = Sinon.spy(ownerQB, 'orWhereIn');

        // exercise and verify
        expect(() => OwnerClass.query().search('something', 'relation')).to.throw(
            Error,
            'relation does not exist'
        );

        expect(relationStub.calledOnce).to.be.true();
        expect(ownerOrWhereInSpy.notCalled).to.be.true();
        expect(ownerSearchSpy.calledOnce).to.be.true();
    });

    it('should throw an error when not searching on relation owner', async flags => {
        // cleanup
        flags.onCleanup = function() {
            OwnerClass.getRelations.restore();
            OwnerClass.query.restore();
        };

        // setup
        OwnerClass.searchFields = ['name'];
        OwnerClass.tableName = 'resources';
        RelatedClass.searchFields = ['action'];
        RelatedClass.tableName = 'permissions';

        const ownerQB = OwnerClass.query();

        const relation = {
            child: {
                ownerModelClass: RelatedClass,
                relatedModelClass: OwnerClass
            }
        };

        const relationStub = Sinon.stub(OwnerClass, 'getRelations').returns(relation);

        Sinon.stub(OwnerClass, 'query').returns(ownerQB);
        const ownerSearchSpy = Sinon.spy(ownerQB, 'search');
        const ownerOrWhereInSpy = Sinon.spy(ownerQB, 'orWhereIn');

        // exercise and verify
        expect(() => OwnerClass.query().search('something', 'child')).to.throw(
            Error,
            'entity is not the relation owner'
        );

        expect(relationStub.calledOnce).to.be.true();
        expect(ownerOrWhereInSpy.notCalled).to.be.true();
        expect(ownerSearchSpy.calledOnce).to.be.true();
    });

    it('searches in  multiple relations', async () => {
        // setup
        const OtherClass = class extends Objection.Model {};
        OtherClass.QueryBuilder = SearchQueryBuilder;

        OwnerClass.searchFields = ['name'];
        OwnerClass.tableName = 'resources';
        RelatedClass.searchFields = ['action'];
        RelatedClass.tableName = 'permissions';
        OtherClass.searchFields = ['name'];
        OtherClass.tableName = 'roles';

        const ownerQB = OwnerClass.query();
        const relatedQB = RelatedClass.query();
        const otherQB = RelatedClass.query();

        const relation = {
            permission: {
                ownerModelClass: OwnerClass,
                ownerProp: { _props: ['id'] },
                relatedModelClass: RelatedClass,
                relatedProp: { _props: ['form_question_id'] }
            },
            role: {
                ownerModelClass: OwnerClass,
                ownerProp: { _props: ['text_document_id'] },
                relatedModelClass: OtherClass,
                relatedProp: { _props: ['id'] }
            }
        };

        const criteria = 'something';
        const relationNames = ['permission', 'role'];

        const relationStub = Sinon.stub(OwnerClass, 'getRelations').returns(relation);
        Sinon.stub(OwnerClass, 'query').returns(ownerQB);

        const relationsQueryBuilders = {
            permission: {
                original: relatedQB,
                stub: Sinon.stub(RelatedClass, 'query').returns(relatedQB)
            },
            role: {
                original: otherQB,
                stub: Sinon.stub(OtherClass, 'query').returns(otherQB)
            }
        };

        const relationSpies = {
            permission: {
                search: Sinon.spy(relatedQB, 'search'),
                select: Sinon.spy(relatedQB, 'select')
            },
            role: {
                search: Sinon.spy(otherQB, 'search'),
                select: Sinon.spy(otherQB, 'select')
            }
        };

        const ownerSearchSpy = Sinon.spy(ownerQB, 'search');
        const ownerOrWhereInSpy = Sinon.spy(ownerQB, 'orWhereIn');

        // exercise
        OwnerClass.query().search(criteria, relationNames);

        // verify
        expect(relationStub.callCount).to.equal(relationNames.length);
        expect(ownerSearchSpy.callCount).to.equal(relationNames.length + 1);
        expect(ownerOrWhereInSpy.callCount).to.equal(relationNames.length);

        expect(ownerSearchSpy.args[0].length).to.equal(2);

        // search owner model with criteria and relation name
        expect(ownerSearchSpy.args[0][0]).to.equal(criteria);
        expect(ownerSearchSpy.args[0][1]).to.equal(relationNames);

        relationNames.forEach((relationName, index) => {
            const relationSpy = relationSpies[relationName];
            const queryBuilder = relationsQueryBuilders[relationName];

            // result set or where id matches result set of related model query builder
            expect(ownerOrWhereInSpy.args[index][0]).to.equal(
                relation[relationName].ownerProp._props
            );
            expect(ownerOrWhereInSpy.args[index][1]).to.instanceOf(
                queryBuilder.original.constructor
            );
            expect(queryBuilder.stub.calledOnce).to.be.true();
            // search related model with criteria
            expect(relationSpy.search.args[0].length).to.equal(1);
            expect(relationSpy.search.args[0][0]).to.equal(criteria);
            // select related model foreign key to owner model
            expect(relationSpy.select.args[0].length).to.equal(1);
            expect(relationSpy.select.args[0][0]).to.equal(
                relation[relationName].relatedProp._props
            );
            // search with criteria only
            expect(ownerSearchSpy.args[index + 1].length).to.equal(1);
            expect(ownerSearchSpy.args[index + 1][0]).to.equal(criteria);
        });
    });
});
