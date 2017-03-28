/**
 * Profile page javascript file
 */

require('../app');
require('../../assets/css/profile.css');
require('../commons/nav'); // import nav code (including logout button handlers) TODO: rethink this.

var commons = require('../commons');
var config = require('../config');

var formElement;

var apiSettings = {
    action: 'update profile',
    method: 'put',
    serializeForm: true,
    beforeXHR: commons.utils.setCsrfTokenHeader,
    beforeSend: beforeSend
};

var validationRules = {
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
    formElement.form(validationRules);
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
