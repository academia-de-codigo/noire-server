$(document).ready(function() {

    $('#logout').click(function(event) {

        event.preventDefault();

        $.ajax({
            type: 'GET',
            url: '/logout',
            timeout: 5000,
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

    });
});
