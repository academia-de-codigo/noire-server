$(document).ready(function() {
    $('form button').api({
        action: 'update user',
        method: 'put',
        serializeForm: true,
        beforeXHR: setCsrfTokenHeader,
        beforeSend: beforeSend,
        successTest: isSuccess,
        onSuccess: refresh
    });
});

// TODO: this is shared code with login.js
function setCsrfTokenHeader(xhr) {
    var crumbToken = $('meta[name=crumb]').attr("content");
    console.log('crumbToken is', crumbToken);
    xhr.setRequestHeader('x-csrf-token', crumbToken);
}

function beforeSend(settings) {
    console.log(settings);

    return settings;
}

function isSuccess(response) {
    return response.success || false;
}

function refresh() {
    window.location.href = '/profile';
}
