if (!Foundation) {
    throw 'Foundation not present';
}

Foundation.Abide.defaults.patterns['password'] = /^(\w{3,30})$/;

$(document).ready(function() {

    var control = $('#show-password');
    var field = $('#form-password');

    control.bind('click', function() {
        if (control.is(':checked')) {
            field.attr('type', 'text');
        } else {
            field.attr('type', 'password');
        }
    });

    $('#login-form')
        .on('formvalid.zf.abide', function() {

            // enable submit button if form is valid
            $('#submit').attr('disabled', false);

        })
        .on('forminvalid.zf.abide', function() {

            // disable submit button if form is valid
            $('#submit').attr('disabled', true);

        })
        .on('submit', function(event) {

            // prevent default browser behaviour
            event.preventDefault();

            // disable form submit button to prevent
            $('#submit').attr('disabled', false);

            // ajax post form
            var param = $("#login-form").serialize();
            $.ajax({
                type: 'POST',
                url: '/login',
                data: param,
                success: function() {
                    window.location.href = '/home';
                },
                error: function() {
                    $('#form-error').css('display', 'block').addClass('alert');
                }
            });

        });

    // Validate form everytime a field changes
    $('#form-email, #form-password').on('change', function() {
        $('#login-form').foundation('validateForm');
    });

});
