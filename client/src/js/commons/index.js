exports.utils = {
    redirectTo: redirectTo,
    setCsrfTokenHeader: setCsrfTokenHeader,
    isSuccess: isSuccess,
    disableFormKeyHandlers: disableFormKeyHandlers
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

/**
 * Disable forms' default key handlers which conflict with the xhr request initiated by our javascript
 * @param  {Object} form Jquery selector object of the form
 */
function disableFormKeyHandlers(form) {
    // prevent browser from canceling xhr request due to browser
    // form handling behaviour when return key is pressed
    form.keypress(function(event) {
        if (event.which === 13) {
            event.preventDefault();
        }
    });
}
