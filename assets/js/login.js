/*
    Login form using ajax
 */

//TODO: handle form submission timeout
// https://github.com/Semantic-Org/Semantic-UI/issues/5121

var formElement, checkBoxElement, passwordElement, errorElement;

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

    // grab DOM elements
    formElement = $('.ui.form');
    checkBoxElement = $('.ui.checkbox');
    passwordElement = $('#form-password');
    errorElement = $('.ui.message.error');

    // setup API endpoints
    $.fn.api.settings.api = {
        'login': '/login',
    };

    setupCheckBoxBehaviour();
    setupFormBehaviour();

});

function setupCheckBoxBehaviour() {

    checkBoxElement.checkbox({
        onChecked: showPassword,
        onUnchecked: hidePassword
    });
}

function setupFormBehaviour() {

    formElement.api({
        action: 'login',
        method: 'post',
        serializeForm: true,
        verbose: true,
        debug: true,
        beforeXHR: setCsrfTokenHeader,
        onSuccess: redirectHome,
        successTest: isSuccess,
        onFailure: showFailure,
        onError: showError,
        onAbort: addShowError
    }).form(validation);
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
