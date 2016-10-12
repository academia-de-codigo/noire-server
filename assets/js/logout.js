$(document).ready(function() {

    var crumb = $('meta[name=crumb]').attr("content");

    $('#desktop-logout').click(logoutHandler);
    $('#mobile-logout').click(logoutHandler);

    function logoutHandler() {

        $.ajax({
            type: 'GET',
            url: '/logout',
            timeout: 5000,
            beforeSend: function(request) {
                request.setRequestHeader('x-csrf-token', crumb);
            },
            success: function(data) {

                console.log(JSON.stringify(data));
                window.location.href = '/home';
            },
            error: function(request, error) {

                var errorMessage;
                if (error === 'timeout') {
                    errorMessage = 'Request timed out';
                } else {
                    errorMessage = 'Could not connect to the server';
                }

                $('#error-message').text(errorMessage);
                $('#form-error').css('display', 'block').addClass('alert');
            }
        });

    }
});
