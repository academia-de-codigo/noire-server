var Path = require('path');

var rules = require('./rules');
var plugins = require('./plugins');
var utils = require('../utils');

module.exports = function(options) {

    var entries = utils.prepareEntries(Path.join(options.BASE_PATH, options.src.path, options.src.js));

    options.optimizations = options.optimizations || {
        minimize: true,
        beautify: false
    };

    if (options.extendDev !== false) {
        extendFromDev();
    }

    return {
        entry: entries,
        module: {
            rules: rules(options)
        },
        output: {
            path: Path.join(options.BASE_PATH, options.dist.path),
            filename: Path.join(options.dist.js, '[name].bundle.js'),
            chunkFilename: Path.join(options.dist.js, '[id].chunk.js') // TODO: investigate this too
        },
        plugins: plugins(options)
    };
};

function extendFromDev() {

    var prodRules = rules;
    var prodPlugins = plugins;
    var devRules = require('../dev/rules');
    var devPlugins = require('../dev/plugins');

    rules = function(options) {
        return devRules(options).concat(prodRules(options));
    };

    plugins = function(options) {
        return devPlugins(options).concat(prodPlugins(options));
    };
}
