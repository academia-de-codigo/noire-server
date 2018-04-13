/*
    Registration form using ajax
 */
require('../app');
require('../../assets/css/register.css');

const qs = require('qs');
const commons = require('../commons');
const config = require('../config');

let segmentElement, formElement, submitElement, checkBoxElement, passwordElement, errorElement;

const apiSettings = {
    action: 'register',
    method: 'post',
    serializeForm: true,
    timeout: config.api.XHR_OPTIONS.TIMEOUT,
    verbose: config.api.XHR_OPTIONS.VERBOSE,
    debug: config.api.XHR_OPTIONS.DEBUG,
    beforeXHR: commons.utils.setCsrfTokenHeader,
    onSuccess: success,
    successTest: commons.utils.isXHRSuccess,
    onFailure: showFailure,
    onError: showError,
    onAbort: addShowError,
    urlData: {
        token: 'invalid-token'
    }
};

const validationRules = {
    on: 'blur', // validate form when user changes field
    fields: {
        name: config.validation.name(),
        email: config.validation.email(),
        username: config.validation.username(),
        password: config.validation.password()
    },
    onValid: updateUI,
    onInvalid: updateUI
};

$(document).ready(function() {
    setupFormUrl();
    grabDomElements();
    setupCheckBoxBehaviour();
    setupRegisterFormBehaviour();
});

function success() {
    segmentElement.addClass('disabled');
    submitElement.attr('disabled', true);

    commons.toast.show({
        header: 'User registration successful',
        message: 'You can now login with your credentials',
        time: 20,
        onClose: commons.utils.redirectTo('/home')
    });
}

function setupFormUrl() {
    // grab the current query string
    const query = window.location.search.substring(1).split('&')[0];

    // it should contain a token query parameter
    const token = qs.parse(query).token;

    // make sure we include it when submitting the form
    apiSettings.urlData.token = token;
}

function grabDomElements() {
    segmentElement = $('.ui.segment');
    formElement = $('.ui.form');
    submitElement = $('form .submit.button');
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

function setupRegisterFormBehaviour() {
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
        submitElement.attr('disabled', false);
    } else {
        submitElement.attr('disabled', true);
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
    } else {
        showError('Invalid server response');
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
