var config = require('../config');
var commons = require('./');

var logoutButton, logoutLink;

var apiSettings = {
    logout: {
        action: 'logout',
        method: 'get',
        timeout: config.api.XHR_OPTIONS.TIMEOUT,
        verbose: config.api.XHR_OPTIONS.VERBOSE,
        debug: config.api.XHR_OPTIONS.DEBUG,
        beforeXHR: commons.utils.setCsrfTokenHeader,
        onComplete: commons.utils.redirectTo('/home')
    }
};

$(document).ready(function() {
    grabDomElements();
    setupLogoutButtonBehaviour();
});

function grabDomElements() {
    logoutButton = $('.ui.logout.button');
    logoutLink = $('a.logout');
}

function setupLogoutButtonBehaviour() {
    logoutButton.api(apiSettings.logout);
    logoutLink.api(apiSettings.logout);
}
