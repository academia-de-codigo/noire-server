var Path = require('path');

var rules = require('./rules');
var plugins = require('./plugins');
var utils = require('../utils');

module.exports = function(options) {

    var entries = utils.prepareEntries(Path.join(options.BASE_PATH, options.src.path, options.src.js));

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
