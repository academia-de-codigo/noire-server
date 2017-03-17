$(document).ready(function() {
    setupNav();
    setupApi();
});

function setupNav() {
    $('a.item').click(function() {
        $('.item').removeClass('active');
        $(this).addClass('active');
    });

    $('.ui.sidebar')
        .sidebar('setting', 'transition', 'overlay')
        .sidebar('attach events', '.sidebar.toggle');
    $('.ui.sidebar').removeClass('disabled');
}

function setupApi() {
    // setup API endpoints
    $.fn.api.settings.api = {
        'login': '/login',
        'logout': '/logout',
        'update user': '/user/{id}'
    };
}
