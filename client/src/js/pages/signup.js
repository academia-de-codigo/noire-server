/*
    SignUp form using ajax
*/
require('../app');
require('../../assets/css/signup.css');

const commons = require('../commons');
const config = require('../config');

let segmentElement, formElement, submitElement, errorElement;

const apiSettings = {
    action: 'signup',
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

function success() {
    segmentElement.addClass('disabled');
    submitElement.attr('disabled', true);

    commons.toast.show({
        header: 'User Sign Up successful',
        message: 'A registration email has been sent, please check your inbox',
        time: 20,
        onClose: commons.utils.redirectTo('/home')
    });
}

function grabDomElements() {
    segmentElement = $('.ui.segment');
    formElement = $('.ui.form');
    submitElement = $('form .submit.button');
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
        submitElement.attr('disabled', false);
    } else {
        submitElement.attr('disabled', true);
    }
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
