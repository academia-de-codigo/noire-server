require('../app');
require('../../assets/css/signup.css');

const commons = require('../commons');
const config = require('../config');

let formElement, errorElement;

const apiSettings = {
    action: 'signup',
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

const validationRules = {
    on: 'blur', // validate form when user changes field
    fields: {
        email: config.validation.email()
    },
    onValid: updateUI,
    onInvalid: updateUI
};

$(document).ready(function() {
    grabDomElements();
    setupSignupFormBehaviour();
});

function grabDomElements() {
    formElement = $('.ui.form');
    errorElement = $('.ui.message.error');
}

function setupSignupFormBehaviour() {
    formElement.form(validationRules).api(apiSettings);
    commons.utils.disableFormKeyHandlers(formElement);
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
