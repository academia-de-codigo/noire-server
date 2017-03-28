/*
    Login form using ajax
 */

// TODO: Would be nice to provide user with timeout error instead of a generic one
// https://github.com/Semantic-Org/Semantic-UI/issues/5121

require('../app');
require('../../assets/css/login.css');

var commons = require('../commons');
var config = require('../config');

var formElement, checkBoxElement, passwordElement, errorElement;

var apiSettings = {
    action: 'login',
    method: 'post',
    serializeForm: true,
    timeout: config.api.XHR_OPTIONS.TIMEOUT,
    verbose: config.api.XHR_OPTIONS.VERBOSE,
    debug: config.api.XHR_OPTIONS.DEBUG,
    beforeXHR: commons.utils.setCsrfTokenHeader,
    onSuccess: commons.utils.redirectTo('/home'),
    successTest: commons.utils.isSuccess,
    onFailure: showFailure,
    onError: showError,
    onAbort: addShowError
};

var validationRules = {
    on: 'blur', // validate form when user changes field
    fields: {
        username: config.validation.username(),
        password: config.validation.password(),
    },
    onValid: updateUI,
    onInvalid: updateUI
};

$(document).ready(function() {

    grabDomElements();
    setupCheckBoxBehaviour();
    setupLoginFormBehaviour();
});

function grabDomElements() {
    formElement = $('.ui.form');
    checkBoxElement = $('.ui.checkbox');
    passwordElement = $('#form-password');
    errorElement = $('.ui.message.error');
}

function setupCheckBoxBehaviour() {

    checkBoxElement.checkbox({
        onChecked: showPassword,
        onUnchecked: hidePassword
    });
}

function setupLoginFormBehaviour() {
    formElement.form(validationRules).api(apiSettings);

    // prevent browser from canceling xhr request due to browser
    // form handling behaviour when return key is pressed
    formElement.keypress(function(event) {
        if (event.which === 13) {
            event.preventDefault();
        }
    });
}

function updateUI() {
    clearError();
    updateSubmitButton();
}

function updateSubmitButton() {

    // enable submit button only if form is valid
    if (formElement.form('is valid')) {
        $('form .submit.button').attr('disabled', false);
    } else {
        $('form .submit.button').attr('disabled', true);
    }
}

function showPassword() {
    passwordElement.attr('type', 'text');
}

function hidePassword() {
    passwordElement.attr('type', 'password');
}

function showFailure(response) {
    if (response && response.message) {
        showError(response.message);
    }
}

function addShowError(errorMessage) {
    // error element is not displayed if form does not contain errors
    formElement.form('add errors', [errorMessage]);
    showError('Could not connect to the server');
}

function showError(errorMessage) {
    errorElement.text(errorMessage);
}

function clearError() {
    errorElement.text('');
}
