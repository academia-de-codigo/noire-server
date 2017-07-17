var Promise = require('bluebird');
var HSError = require('../../../../../error');
var ResourceService = require('../../../services/resource');
var ListHelpers = require('./helpers/list');
var PartialHelper = require('./helpers/partial');

var internals = {};

internals.resourceSortOptions = [{
    value: '',
    name: 'Sort',
},
{
    name: 'Name',
},];

exports.listResources = function(request, reply) {

    request.log(['admin', 'listResources', 'debug']);
    var getResourceCount = ResourceService.count(request.query);
    var getResources = ResourceService.list(request.query);

    Promise.join(getResourceCount, getResources, function(resourceCount, resources) {

        return reply.view('pages/admin', {
            getAdminPartial: PartialHelper.getPartialHelper(request.params.partial),
            resources: resources,
            searchValue: ListHelpers.getSearchValue(request.query),
            searchQuery: ListHelpers.getQueryForSearch(request.query),
            sortOptions: ListHelpers.getSortAttributes(internals.resourceSortOptions, request.query),
            limitOptions: ListHelpers.getLimitAttributes(request.query),
            getNextPage: ListHelpers.getNextPageHelper(request.query, resourceCount),
            getPreviousPage: ListHelpers.getPreviousPageHelper(request.query),
            getFirstPage: ListHelpers.getFirstPageHelper(request.query),
            getLastPage: ListHelpers.getLastPageHelper(request.query, resourceCount)
        });
    }).catch(function(error) {

        reply(HSError.toBoom(error));
    });

};
