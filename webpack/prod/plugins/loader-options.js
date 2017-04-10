var LoaderOptionsPlugin = require('webpack').LoaderOptionsPlugin;

module.exports = function(options) {

    var config = {
        minimize: options.optimizations? options.optimizations.minimize : true,
        debug: false
    };

    return new LoaderOptionsPlugin(config);
};
