/*
    Login form using ajax
 */

// TODO: Would be nice to provide user with timeout error instead of a generic one
// https://github.com/Semantic-Org/Semantic-UI/issues/5121
var XHR_TIMEOUT = 5000;
var XHR_VERBOSE = true;
var XHR_DEBUG = true;

var formElement, checkBoxElement, passwordElement, logoutButton, logoutLink, errorElement;

var apiSettings = {
    login: {
        action: 'login',
        method: 'post',
        timeout: XHR_TIMEOUT,
        serializeForm: true,
        verbose: XHR_VERBOSE,
        debug: XHR_DEBUG,
        beforeXHR: setCsrfTokenHeader,
        onSuccess: redirectHome,
        successTest: isSuccess,
        onFailure: showFailure,
        onError: showError,
        onAbort: addShowError
    },
    logout: {
        action: 'logout',
        method: 'get',
        timeout: XHR_TIMEOUT,
        verbose: XHR_VERBOSE,
        debug: XHR_DEBUG,
        beforeXHR: setCsrfTokenHeader,
        onComplete: redirectHome
    }
};

var validation = {
    on: 'blur', // validate form when user changes field
    fields: {
        username: {
            identifier: 'username',
            rules: [{
                type: 'empty',
                prompt: 'Please enter a username'
            }, {
                type: 'minLength[3]',
                prompt: 'Your username needs at least {ruleValue} characters'
            }, {
                type: 'maxLength[30]',
                prompt: 'Your username can not have more than {ruleValue} characters'
            }]
        },
        password: {
            identifier: 'password',
            rules: [{
                type: 'empty',
                prompt: 'Please enter a password'
            }, {
                type: 'minLength[3]',
                prompt: 'Your password needs at least {ruleValue} characters'
            }, {
                type: 'maxLength[30]',
                prompt: 'Your password can not have more than {ruleValue} characters'
            }]
        }
    },
    onValid: updateUI,
    onInvalid: updateUI
};

$(document).ready(function() {
    grabDomElements();
    setupCheckBoxBehaviour();
    setupLoginFormBehaviour();
    setupLogoutButtonBehaviour();
});

function grabDomElements() {
    formElement = $('.ui.form');
    checkBoxElement = $('.ui.checkbox');
    passwordElement = $('#form-password');
    errorElement = $('.ui.message.error');
    logoutButton = $('.ui.logout.button');
    logoutLink = $('a.logout');
}

function setupCheckBoxBehaviour() {

    checkBoxElement.checkbox({
        onChecked: showPassword,
        onUnchecked: hidePassword
    });
}

function setupLoginFormBehaviour() {
    formElement.api(apiSettings.login).form(validation);
}

function setupLogoutButtonBehaviour() {
    logoutButton.api(apiSettings.logout);
    logoutLink.api(apiSettings.logout);
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

function setCsrfTokenHeader(xhr) {
    var crumbToken = $('meta[name=crumb]').attr("content");
    xhr.setRequestHeader('x-csrf-token', crumbToken);
}

function redirectHome() {
    window.location.href = '/home';
}

function isSuccess(response) {
    return response.success || false;
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
