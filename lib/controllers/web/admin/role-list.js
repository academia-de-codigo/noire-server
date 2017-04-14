var Promise = require('bluebird');
var HSError = require('../../../error');
var ListHelpers = require('./model-list');
var RoleService = require('../../../services/role');
var PartialHelper = require('./partial');

var internals = {};

internals.roleSortOptions = [
    {
        value: '',
        name: 'Sort',
    },
    {
        name: 'Name',
    },
    {
        name: 'Description',
    }
];

exports.listRoles = function(request, reply) {

    request.log(['admin', 'listRoles', 'debug']);
    var getRoleCount = RoleService.count(request.query);
    var getRoles = RoleService.list(request.query);

    Promise.join(getRoleCount, getRoles, function(roleCount, roles) {

        return reply.view('pages/admin', {
            getAdminPartial: PartialHelper.getPartialHelper(request.params.partial),
            roles: roles,
            searchValue: ListHelpers.getSearchValue(request.query),
            searchQuery: ListHelpers.getQueryForSearch(request.query),
            sortOptions: ListHelpers.getSortAttributes(internals.roleSortOptions, request.query),
            limitOptions: ListHelpers.getLimitAttributes(request.query),
            getNextPage: ListHelpers.getNextPageHelper(request.query, roleCount),
            getPreviousPage: ListHelpers.getPreviousPageHelper(request.query),
            getFirstPage: ListHelpers.getFirstPageHelper(request.query),
            getLastPage: ListHelpers.getLastPageHelper(request.query, roleCount)
        });
    }).catch(function(error) {

        reply(HSError.toBoom(error));
    });
};
