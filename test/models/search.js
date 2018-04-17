const Lab = require('lab');
const Sinon = require('sinon');
const BaseModel = require('models/base');
const SearchQueryBuilder = require('models/search');

const { before, describe, expect, it } = (exports.lab = Lab.script());

describe('Model: base', function() {
    let baseModel;

    before(() => {
        baseModel = new BaseModel();
    });

    it('returns the search query builder', () => {
        expect(baseModel.$query().search()).to.be.an.instanceof(SearchQueryBuilder);
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
        const model = new class extends BaseModel {
            static get searchFields() {
                return fakeFields;
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
});
