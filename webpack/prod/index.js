var Path = require('path');
var utils = require('../utils');

var Rules = require('./rules');
var Plugins = require('./plugins');
var DevRules = require('../dev/rules');
var DevPlugins = require('../dev/plugins');

module.exports = function(options) {

    var paths, entryPoints, entries, rules, plugins;

    paths = options.paths;
    entryPoints = Path.join(paths.src.path, paths.src.entryPoints);

    entries = utils.prepareEntries(entryPoints);
    rules = utils.init(Rules, options);
    plugins = utils.init(Plugins, options);

    paths.optimizations = paths.optimizations || {
        minimize: true,
        beautify: false
    };

    if (paths.extendDev !== false) {
        rules = utils.init(DevRules, paths).concat(rules);
        plugins = utils.init(DevPlugins, paths).concat(plugins);
    }

    return {
        entry: entries,
        module: {
            rules: rules
        },
        output: {
            path: paths.output.path,
            filename: Path.join(paths.output.js, '[name].bundle.js')
        },
        plugins: plugins
    };
};
