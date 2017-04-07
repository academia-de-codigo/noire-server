var Path = require('path');
var Glob = require('glob');

exports.prepareEntries = function(path) {

    var entryPoints = Glob.sync(Path.join(path, '**/*.js'));
    var entries = {};

    entryPoints.forEach(function(file) {
        var name;

        name = Path.basename(file, '.js');
        entries[name] = file;
    });

    return entries;
};
