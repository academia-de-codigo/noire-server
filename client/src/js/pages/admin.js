require('../../assets/css/admin.css');
require('../app');
require('../commons/nav');

var userTable, roleTable, dropdown, search, searchValue;

$(document).ready(function() {

    grabDomElements();
    setupUserTableBehaviour();
    setupRoleTableBehaviour();
    setupDropdownBehaviour();
    setupSearchBehaviour();

});

function grabDomElements() {
    userTable = $('.ui.user.table');
    roleTable = $('.ui.role.table');
    dropdown = $('.ui.dropdown');
    search = $('.ui.search');
    searchValue = $('#search');
}

function setupSearchBehaviour() {

    searchValue.keydown(function(event) {
        if (event.which === 13) {
            executeQuery();
        }
    });

    search.on('click', '.link.icon', function() {
        executeQuery();
    });
}

function setupDropdownBehaviour() {
    dropdown.dropdown({
        action: function(text, value) {

            window.location.href = $.fn.api.settings.api['list with query'].replace(/{query}/, value);
        }
    });

}

function setupUserTableBehaviour() {

    // delegate table click events on the corresponding row
    userTable.on('click', 'tbody tr', function(event) {

        // api can trigger XHR call..
        /*$(event.currentTarget).api({
            action: 'get user',
            on: 'now'
        });*/

        // .. but actually we want the browser to issue request for a new page
        var userId = $(event.currentTarget).attr('data-id');
        window.location.href = $.fn.api.settings.api['view user'].replace(/{id}/, userId);
    });
}

function setupRoleTableBehaviour() {

    // delegate table click events on the corresponding row
    roleTable.on('click', 'tbody tr', function(event) {

        var roleId = $(event.currentTarget).attr('data-id');
        window.location.href = $.fn.api.settings.api['view role'].replace(/{id}/, roleId);
    });
}

function executeQuery() {

    var value = $(searchValue).val().trim();
    var previousQuery = searchValue.attr('data-query');

    if (!value) {
        window.location.href = previousQuery || window.location.pathname;
        return;
    }

    value = previousQuery ?
        previousQuery + '&search=' + value :
        '?search=' + value;


    window.location.href = $.fn.api.settings.api['list with query'].replace(/{query}/, value);
}
