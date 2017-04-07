var assets = require('./assets');
var javascript = require('./javascript');

var rules = [
    javascript.jQueryExposer,
    javascript.windowBind,
    assets.extractCSS,
    assets.extractImages,
    assets.extractFonts
];

module.exports = rules;
