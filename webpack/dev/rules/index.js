var Path = require('path');
var Glob = require('glob');

var rulesFiles = Glob.sync(Path.join(__dirname, 'internals', '**/*.js'));

module.exports = rules;

function rules(options) {

    var allRules = [];

    rulesFiles.forEach(function(file) {

        var rules = require(file);

        Object.keys(rules).forEach(function(rule) {
            allRules.push(rules[rule](options));
        });
    });

    return allRules;
}
