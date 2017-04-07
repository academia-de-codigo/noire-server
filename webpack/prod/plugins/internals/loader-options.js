var LoaderOptionsPlugin = require('webpack').LoaderOptionsPlugin;

module.exports = function(options) {

    var config = {
        minimize: options.minimize || true,
        debug: false
    };

    return new LoaderOptionsPlugin(config);
};
