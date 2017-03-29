/**
 * Profile page javascript file
 */

require('../app');
require('../../assets/css/profile.css');
require('../commons/nav'); // import nav code (including logout button handlers) TODO: rethink this.

var commons = require('../commons');
var config = require('../config');

var formElement, submitButton;

var apiSettings = {
    action: 'update profile',
    method: 'put',
    serializeForm: true,
    beforeXHR: commons.utils.setCsrfTokenHeader,
    beforeSend: stripOptionals
};

var validationRules = {
    on: 'change',
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
    },
    onValid: function() {
        if (fieldsAreEmpty()) {
            toggleButton(false);
            return;
        }

        toggleButton(true);
    },
    onInvalid: function() {
        toggleButton(false);
    }
};

$(document).ready(function() {

    formElement = $('.ui.form');
    submitButton = $('.ui.form button');

    setupForm();
});

function setupForm() {
    commons.utils.disableFormKeyHandlers(formElement);
    formElement.form(validationRules);
    formElement.api(apiSettings);
}

/**
 * toggles or sets a button state
 * @param  {Boolean} absoluteState if supplied, button state will be set to this state (true - active, false - not actve). if not, it will be toggled
 */
function toggleButton(absoluteState) {

    // get current button state
    var buttonState = !submitButton.attr('disabled');
    var disable;

    // if the button's state is the same as the one you want to put it, don't touch it
    if (buttonState === absoluteState) {
        return;
    }

    // no state provided, toggle its state.
    if (absoluteState === undefined) {
        disable = !buttonState;
    } else {
        // true means false, and false means true
        disable = !absoluteState;
    }

    submitButton.attr('disabled', disable);
}

function fieldsAreEmpty() {
    var fields = formElement.serializeObject();

    return Object.keys(fields).every(function(field) {
        return !fields[field];
    });
}

function stripOptionals(settings) {

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
