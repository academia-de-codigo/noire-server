var rules = {};

module.exports = rules;

// expose jQuery to the global scope as soon as it is required
rules.jQueryExposer = function() {
    return {
        test: require.resolve('jquery'),
        use: [{
            loader: 'expose-loader',
            options: 'jQuery'
        }, {
            loader: 'expose-loader',
            options: '$'
        }]
    };
};

// binds 'this' to window on scripts that think `this` is the window object
// using only on semantic scripts atm
rules.windowBind = function() {
    return {
        test: /\.js$/,
        include: /semantic/,
        use: ['imports-loader?this=>window']
    };
};
