var internals = {};

internals.buildQuery = function(query) {

    var queryString, key, value;
    queryString = '';

    for (key in query) {
        value = query[key];

        if (value) {
            queryString += key + '=' + value + '&';
        }
    }
    if (queryString.length > 0) {
        queryString = '?' + queryString.substring(0, queryString.length - 1); //add the '?' and chop off last '&'
    }
    return queryString;
};

internals.buildSortQuery = function(query) {
    var queryString = '?';

    if (query.search) {
        queryString += 'search=' + query.search + '&';
    }

    if (query.limit) {
        queryString += 'limit=' + query.limit + '&';
    }

    return queryString + 'sort=' + query.sort;
};

internals.buildLimitQuery = function(query) {
    var queryString = '?';

    if (query.search) {
        queryString += 'search=' + query.search + '&';
    }

    if (query.sort) {
        queryString += 'sort=' + query.sort + '&';
    }

    return queryString + 'limit=' + query.limit;
};

// remember last query without pagination values, to build the search query
exports.getQueryForSearch = function(query) {
    var queryString, key, value;
    queryString = '';

    for (key in query) {
        value = query[key];

        if (value &&
            (key === 'limit' ||
                key === 'sort' ||
                key === 'descending')) {
            queryString += key + '=' + value + '&';
        }
    }
    if (queryString.length > 0) {
        queryString = '?' + queryString.substring(0, queryString.length - 1); //add the '?' and chop off last '&'
    }
    return queryString;
};

// remember the search value from query, to show it on the input box
exports.getSearchValue = function(query) {

    if (query.search) {
        return query.search;
    }
};

// generate name, value and selected attributes dinamically for the option tag
exports.getSortAttributes = function(sortOptions, queryParams) {

    var initialState = queryParams.sort;

    sortOptions.forEach(function(option) {
        //don't build a query for the default
        if (option.name === 'Sort') {
            return;
        }

        queryParams.sort = option.name.toLowerCase();
        option.value = internals.buildSortQuery(queryParams);
        option.selected = initialState === option.name.toLowerCase();

    });

    queryParams.sort = initialState;

    return sortOptions;
};

// generate attributes dinamically for the option tag
exports.getLimitAttributes = function(queryParams) {

    var initialState = queryParams.limit;
    var limitOptions = [
        {
            value: '',
            name: 'Limit'
        },
        {
            name: 1,
        },
        {
            name: 50,
        },
        {
            name: 100,
        }
    ];

    limitOptions.forEach(function(option) {
        //don't build a query for the default
        if (option.name === 'Limit') {
            return;
        }

        queryParams.limit = option.name;
        option.value = internals.buildLimitQuery(queryParams);
        option.selected = initialState === option.name;

    });

    queryParams.limit = initialState;
    return limitOptions;
};

exports.getNextPageHelper = function(query, count) {

    var page = query.page || 1;
    var limit = query.limit || count;

    return function() {
        // if there's no query value for page, assume we're on page 1
        // also, don't increment if we're on laste page
        if (page < (count / limit)) {
            query.page = parseInt(page) + 1;
        } else {
            query.page = Math.ceil(count / limit);
        }

        return internals.buildQuery(query, count);
    };
};

exports.getPreviousPageHelper = function(query) {
    var page = query.page || 1;
    return function() {
        if (page > 1) {
            query.page = parseInt(page) - 1;
        }
        return internals.buildQuery(query);
    };
};

exports.getFirstPageHelper = function(query) {
    return function() {
        query.page = 1;
        return internals.buildQuery(query);
    };
};

exports.getLastPageHelper = function(query, count) {
    var limit = query.limit || count;
    return function() {
        query.page = Math.ceil(count / parseInt(limit));
        return internals.buildQuery(query, count);
    };
};
