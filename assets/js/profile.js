var api = {
    action: 'update profile',
    method: 'put',
    serializeForm: true,
    beforeXHR: setCsrfTokenHeader,
    beforeSend: beforeSend
}

var validation = {
    on: 'blur',
    fields: {
        username: {
            identifier: 'username',
            optional: true,
            rules: [{
                type: 'minLength[3]',
                prompt: 'Your username needs at least {ruleValue} characters'
            }, {
                type: 'maxLength[30]',
                prompt: 'Your username can not have more than {ruleValue} characters'
            }]
        },
        email: {
            identifier: 'email',
            optional: true,
            rules: [{
                type: 'email',
                prompt: 'Please enter a valid email address'
            }]
        },
        password: {
            identifier: 'password',
            optional: true,
            rules: [{
                type: 'minLength[3]',
                prompt: 'Your password needs at least {ruleValue} characters'
            }, {
                type: 'maxLength[30]',
                prompt: 'Your password can not have more than {ruleValue} characters'
            }]
        },
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

    formElement = $('#profile-form form');
    disableDefaultHandlers(formElement);

    formElement.api(api);
    formElement.form(validation);
});

// TODO: this is shared code with login.js
function setCsrfTokenHeader(xhr) {
    var crumbToken = $('meta[name=crumb]').attr("content");
    console.log('crumbToken is', crumbToken);
    xhr.setRequestHeader('x-csrf-token', crumbToken);
}

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

function isSuccess(response) {
    return response.success || false;
}

function refresh() {
    window.location.href = '/profile';
}

function disableDefaultHandlers(element) {
    element.keypress(function(event) {
        if (event.which === 13) {
            event.preventDefault();
        }
    });
}
