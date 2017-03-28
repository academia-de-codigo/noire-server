var $ = require('jquery');

exports.utils = {
    redirectTo: redirectTo,
    setCsrfTokenHeader: setCsrfTokenHeader,
    isSuccess: isSuccess
};

function setCsrfTokenHeader(xhr) {
    var crumbToken = $('meta[name=crumb]').attr('content');
    xhr.setRequestHeader('x-csrf-token', crumbToken);
}

function redirectTo(url) {

    return function() {
        window.location.href = url;
    };
}

function isSuccess(response) {
    return response.success || false;
}
