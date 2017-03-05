$(document).ready(function() {
    setupNav();
});

function setupNav() {
    $('a.item').click(function() {
        $('.item').removeClass('active');
        $(this).addClass('active');
    });
}
