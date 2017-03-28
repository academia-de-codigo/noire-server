/**
 * Profile page javascript file
 */

var app = require('../app');
require('../css/profile.css');

var $ = require('jquery');
require('../commons/nav'); // import nav code (including logout button handlers) TODO: rethink this.

var commons = app.commons;
var config = app.config;

var formElement;

var apiSettings = {
    action: 'update profile',
    method: 'put',
    serializeForm: true,
    beforeXHR: commons.utils.setCsrfTokenHeader,
    beforeSend: beforeSend
};

var validation = {
    on: 'blur',
    fields: {
        username: config.validation.username(true),
        email: config.validation.email(true),
        password: config.validation.password(true),
        confPassword: {
            identifier: 'pw-confirmation',
            depends: 'password',
            rules: [{
                type: 'match[password]',
                prompt: 'Passwords must match.'
            }]
        },
    }
};

$(document).ready(function() {

    formElement = $('.ui.form');
    formElement.form(validation);
    formElement.api(apiSettings);
});

function beforeSend(settings) {

    var data = {};

    // strip empty optional fields from data object (empty strings)
    Object.keys(settings.data).forEach(function(field) {

        if (!settings.data[field]) {
            return;
        }

        data[field] = settings.data[field];
    });

    settings.data = data;

    return settings;
}
