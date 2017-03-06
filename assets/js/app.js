$(document).ready(function() {
    setupNav();
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
