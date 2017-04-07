var Path = require('path');
var Glob = require('glob');

var pluginFiles = Glob.sync(Path.join(__dirname, 'internals', '**/*.js'));

module.exports = plugins;

function plugins(options) {

    return pluginFiles.map(function(file) {
        return require(file)(options);
    });
}
