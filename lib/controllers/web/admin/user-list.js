var Promise = require('bluebird');
var HSError = require('../../../error');
var ListHelpers = require('./model-list');
var UserService = require('../../../services/user');
var PartialHelper = require('./partial');

var internals = {};

internals.userSortOptions = [
    {
        value: '',
        name: 'Sort',
    },
    {
        name: 'Username',
    },
    {
        name: 'Name',
    },
    {
        name: 'Email',
    }
];

exports.listUsers = function(request, reply) {

    request.log(['admin', 'listUsers', 'debug']);

    var getUserCount = UserService.count(request.query);
    var getUsers = UserService.list(request.query);

    Promise.join(getUserCount, getUsers, function(userCount, users) {
        return reply.view('pages/admin', {
            getAdminPartial: PartialHelper.getPartialHelper(request.params.partial),
            users: users,
            searchValue: ListHelpers.getSearchValue(request.query),
            searchQuery: ListHelpers.getQueryForSearch(request.query),
            sortOptions: ListHelpers.getSortAttributes(internals.userSortOptions, request.query),
            limitOptions: ListHelpers.getLimitAttributes(request.query),
            getNextPage: ListHelpers.getNextPageHelper(request.query, userCount),
            getPreviousPage: ListHelpers.getPreviousPageHelper(request.query, userCount),
            getFirstPage: ListHelpers.getFirstPageHelper(request.query, userCount),
            getLastPage: ListHelpers.getLastPageHelper(request.query, userCount)
        });
    }).catch(function(error) {

        reply(HSError.toBoom(error));
    });
};
