require('jquery');
require('form-serializer');
require('../semantic/dist/semantic.css');
require('./css/app.css');
require('../semantic/dist/semantic.js');

exports.config = require('./config');
exports.commons = require('./commons');

$(document).ready(function() {
    setupNav();
    setupApi();
});

function setupNav() {
    $('a.item').click(function() {
        $('.item').removeClass('active');
        $(this).addClass('active');
    });

    $('.ui.sidebar')
        .sidebar('setting', 'transition', 'overlay')
        .sidebar('attach events', '.sidebar.toggle');
    $('.ui.sidebar').removeClass('disabled');
}

function setupApi() {
    // setup API endpoints
    $.fn.api.settings.api = exports.config.api.routes;
}
