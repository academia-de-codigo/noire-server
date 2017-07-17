var Code = require('code'); // the assertions library
var Lab = require('lab'); // the test framework
var Sinon = require('sinon');
var ModelList = require('../../../../../../../lib/modules/authorization/controllers/web/admin/helpers/list');

var lab = exports.lab = Lab.script(); // export the test script

// make lab feel like jasmine
var describe = lab.experiment;
var it = lab.test;
var expect = Code.expect;

var internals = {};

internals.sortOptions = [
    {
        name: 'Name'
    },
    {
        name: 'Description'
    }
];

describe('Web Controller: admin - model list', function() {



    it('goes to next page', function(done) {
        var count = 5;
        var query = {
            search: 'test',
            limit: 1,
            page: 3,
            descending: true,
            sort: 'email'
        };

        var nextSpy = Sinon.spy(ModelList, 'getNextPageHelper');
        ModelList.getNextPageHelper(query, count);

        var querySpyCall = ModelList.getNextPageHelper.getCall(0);

        expect(querySpyCall.returnValue()).to.equals('?search=test&limit=1&page=4&descending=true&sort=email');
        expect(query.page).to.equals(4);
        expect(query.limit).to.exist();
        expect(query.search).to.exist();
        expect(query.sort).to.exist();
        expect(query.descending).to.exist();
        nextSpy.restore();
        done();
    });

    it('does not build query for undefined values', function(done) {
        var count = 5;
        var query = {
            search: undefined,
            limit: undefined,
            page: undefined,
            sort: undefined,
            descending: undefined
        };
        var nextSpy = Sinon.spy(ModelList, 'getNextPageHelper');
        ModelList.getNextPageHelper(query, count);

        var querySpyCall = ModelList.getNextPageHelper.getCall(0);

        expect(querySpyCall.returnValue()).to.equals('?page=1');
        expect(query.page).to.equals(1);
        expect(query.limit).to.not.exist();
        expect(query.search).to.not.exist();
        expect(query.sort).to.not.exist();
        expect(query.descending).to.not.exist();
        nextSpy.restore();

        done();
    });

    it('stays in the same page if in its last', function(done) {
        var count = 2;
        var query = {
            search: 'test',
            limit: 1,
            page: 2
        };

        var nextSpy= Sinon.spy(ModelList, 'getNextPageHelper');
        ModelList.getNextPageHelper(query, count);

        var querySpyCall = ModelList.getNextPageHelper.getCall(0);
        expect(querySpyCall.returnValue()).to.equals('?search=test&limit=1&page=2');
        expect(query.page).to.equals(2);
        expect(query.limit).to.exist();
        expect(query.search).to.exist();
        expect(query.sort).to.not.exist();
        expect(query.descending).to.not.exist();
        nextSpy.restore();
        done();
    });

    it('goes to previous page', function(done) {
        var count = 5;
        var query = {
            page: 4,
            search: 'test'
        };

        var previousSpy = Sinon.spy(ModelList, 'getPreviousPageHelper');
        ModelList.getPreviousPageHelper(query, count);

        var querySpyCall = ModelList.getPreviousPageHelper.getCall(0);
        expect(querySpyCall.returnValue()).to.equals('?page=3&search=test');
        expect(query.page).to.equals(3);
        expect(query.limit).to.not.exist();
        expect(query.search).to.exist();
        expect(query.sort).to.not.exist();
        expect(query.descending).to.not.exist();
        previousSpy.restore();
        done();
    });

    it('stays in the same page if on its first', function(done) {
        var query = {
            page: 1,
            search: 'test'
        };
        var previousSpy =Sinon.spy(ModelList, 'getPreviousPageHelper');
        ModelList.getPreviousPageHelper(query);

        var querySpyCall = ModelList.getPreviousPageHelper.getCall(0);
        expect(querySpyCall.returnValue()).to.equals('?page=1&search=test');
        expect(query.page).to.equals(1);
        expect(query.limit).to.not.exist();
        expect(query.search).to.exist();
        expect(query.sort).to.not.exist();
        expect(query.descending).to.not.exist();
        previousSpy.restore();
        done();
    });

    it('goes to the last page', function(done) {
        var count = 201;
        var query = {
            limit: 5,
            search: 'test'
        };

        var lastSpy = Sinon.spy(ModelList, 'getLastPageHelper');
        ModelList.getLastPageHelper(query, count);

        var querySpyCall = ModelList.getLastPageHelper.getCall(0);
        expect(querySpyCall.returnValue()).to.equals('?limit=5&search=test&page=41');
        expect(query.page).to.equals(41);
        expect(query.limit).to.equals(5);
        expect(query.search).to.exist();
        expect(query.sort).to.not.exist();
        expect(query.descending).to.not.exist();
        lastSpy.restore();
        done();
    });

    it('goes to the first page', function(done) {
        var count = 100;
        var query = {
            page: 20,
            search: 'test'
        };
        var firstSpy = Sinon.spy(ModelList, 'getFirstPageHelper');
        ModelList.getFirstPageHelper(query, count);

        var querySpyCall = ModelList.getFirstPageHelper.getCall(0);
        expect(querySpyCall.returnValue()).to.equals('?page=1&search=test');
        expect(query.page).to.equals(1);
        expect(query.limit).to.not.exist();
        expect(query.search).to.exist();
        expect(query.sort).to.not.exist();
        expect(query.descending).to.not.exist();
        firstSpy.restore();
        done();
    });

    it('ignores pagination if count is zero', function(done) {
        var count = 0;
        var query = {
            page: 20,
            search: 'test'
        };
        var firstSpy = Sinon.spy(ModelList, 'getFirstPageHelper');
        ModelList.getFirstPageHelper(query, count);

        var querySpyCall = ModelList.getFirstPageHelper.getCall(0);
        expect(querySpyCall.returnValue()).to.equals('?search=test');
        expect(query.page).to.equals(0);
        expect(query.limit).to.not.exist();
        expect(query.search).to.exist();
        expect(query.sort).to.not.exist();
        expect(query.descending).to.not.exist();
        firstSpy.restore();
        done();
    });


    it('creates query for each sort option', function(done) {

        var sortOptions = internals.sortOptions;
        var query = {};

        sortOptions = ModelList.getSortAttributes(sortOptions, query);
        expect(sortOptions).to.be.an.array();
        sortOptions.forEach(function(option) {
            expect(option.name).to.exist();
            expect(option.value).to.exist();
            expect(option.value).to.equals('?sort=' + option.name.toLowerCase());
            expect(option.selected).to.exist();
        });
        done();
    });

    it('creates query for each sort option ignoring other params except limit and search', function(done) {
        var sortOptions = internals.sortOptions;
        var query = {
            search: 'test',
            limit: 10,
            sort: 'email',
            page: 5,
            descending: true
        };

        sortOptions = ModelList.getSortAttributes(sortOptions, query);
        expect(sortOptions).to.be.an.array();
        sortOptions.forEach(function(option) {
            expect(option.name).to.exist();
            expect(option.value).to.exist();
            expect(option.value).to.equals('?search=test&limit=10&sort=' + option.name.toLowerCase());
            expect(option.selected).to.exist();
        });

        done();
    });

    it('creates query for each limit option', function(done) {
        var query = {};
        var limitOptions = ModelList.getLimitAttributes(query);

        expect(limitOptions).to.be.an.array();
        limitOptions.forEach(function(option) {
            expect(option.name).to.exist();
            expect(option.value).to.exist();
            if (option.name === 'Limit') {
                expect(option.value).to.equals('');
                expect(option.selected).to.not.exist();
            } else {
                expect(option.value).to.equals('?limit=' + option.name);
                expect(option.selected).to.exist();
            }
        });
        done();
    });

    it('creates query for each limit option ignoring other params except sort and search', function(done) {
        var query = {
            search: 'test',
            limit: 10,
            sort: 'email',
            page: 5,
            descending: true
        };

        var limitOptions = ModelList.getLimitAttributes(query);

        expect(limitOptions).to.be.an.array();
        limitOptions.forEach(function(option) {
            expect(option.name).to.exist();
            expect(option.value).to.exist();
            if (option.name === 'Limit') {
                expect(option.value).to.equals('');
                expect(option.selected).to.not.exist();
            } else {
                expect(option.value).to.equals('?search=test&sort=email&limit=' + option.name);
                expect(option.selected).to.exist();
            }
        });
        done();
    });

    it('creates query for search, ignoring only page values', function(done) {
        var query = {
            search: 'test',
            limit: 10,
            sort: 'email',
            page: 5,
            descending: true
        };
        var searchQuery = ModelList.getQueryForSearch(query);
        expect(searchQuery).to.equals('?limit=10&sort=email&descending=true');
        expect(query.limit).to.exist();
        expect(query.search).to.exist();
        expect(query.sort).to.exist();
        expect(query.descending).to.exist();
        done();
    });

    it('does not create query for undefined values, when using search', function(done) {
        var query = {
            search: undefined,
            limit: undefined,
            sort: undefined,
            page: undefined,
            descending: undefined
        };
        var searchQuery = ModelList.getQueryForSearch(query);
        expect(searchQuery).to.equals('');
        expect(query.limit).to.not.exist();
        expect(query.search).to.not.exist();
        expect(query.sort).to.not.exist();
        expect(query.descending).to.not.exist();
        done();
    });

    it('returns search value', function(done) {
        var query = {search: 'test'};
        var searchValue = ModelList.getSearchValue(query);
        expect(searchValue).to.exist();
        expect(searchValue).to.equals('test');
        done();
    });

    it('does not return search value if undefined', function(done) {
        var query = {search: ''};

        var searchValue = ModelList.getSearchValue(query);
        expect(searchValue).to.not.exist();
        done();
    });


});
