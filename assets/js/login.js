/*
    Login form using ajax
 */

var formElement, checkBoxElement, passwordElement;

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
    onValid: updateSubmitButton,
    onInvalid: updateSubmitButton
};

$(document).ready(function() {

    // grab DOM elements
    formElement = $('.ui.form');
    checkBoxElement = $('.ui.checkbox');
    passwordElement = $('#form-password');

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
        onSuccess: redirectHome
    }).form(validation);
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

function redirectHome(response) {
    console.log(response);
    window.location.href = '/home';
}
