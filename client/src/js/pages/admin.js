require('../../assets/css/admin.css');
require('../app');
require('../commons/nav');

var commons = require('../commons');

var userTable, roleTable, dropdown, search, searchValue, activationButton, deleteUserButton, deleteRoleButton;

$(document).ready(function() {

    grabDomElements();
    setupUserTableBehaviour();
    setupRoleTableBehaviour();
    setupDropdownBehaviour();
    setupSearchBehaviour();
    setupActivationButtonBehaviour();
    setupDeleteUserButtonBehaviour();
    setupDeleteRoleButtonBehaviour();

});

function grabDomElements() {
    userTable = $('.ui.user.table');
    roleTable = $('.ui.role.table');
    dropdown = $('.ui.dropdown');
    search = $('.ui.search');
    searchValue = $('#search');
    activationButton = $('.activation');
    deleteUserButton = $('.link.trash.user.icon');
    deleteRoleButton = $('.link.trash.role.icon');
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
    userTable.on('click', 'tbody tr .user-row', function(event) {

        // api can trigger XHR call..
        /*$(event.currentTarget).api({
            action: 'get user',
            on: 'now'
        });*/

        // .. but actually we want the browser to issue request for a new page
        var userId = $(event.currentTarget.closest('tr')).attr('data-id');
        window.location.href = $.fn.api.settings.api['view user'].replace(/{id}/, userId);
    });
}

function setupUserStatusModal(target, id) {

    $('#status-user-' + id).modal({
        onApprove: toggleUserStatus(target, id)
    }).modal('show');
}

function setupDeleteUserModal(target, id) {

    $('#delete-user-' + id).modal({
        onApprove: deleteUser(target, id)
    }).modal('show');
}

function setupDeleteRoleModal(target, id) {

    var element = $('#delete-role-' + id);

    element.api({
        action: 'role actions',
        method: 'get',
        on: 'now',
        beforeXHR: commons.utils.setCsrfTokenHeader,
        urlData: {
            id: id
        },
        onSuccess: function(role) {
            if (role.permissions.length > 0 || role.users.length > 0) {
                element.find('#role-warning').removeAttr('hidden');
            }
        }
    });

    element.modal({
        onApprove: deleteRole(target, id)
    }).modal('show');
}

function setupDeleteUserButtonBehaviour() {
    deleteUserButton.on('click', function(event) {
        var userId = $(event.currentTarget.closest('tr')).attr('data-id');
        setupDeleteUserModal(deleteUserButton, userId);
    });
}

function setupActivationButtonBehaviour() {

    activationButton.on('click', function(event) {
        var userId = $(event.currentTarget.closest('tr')).attr('data-id');
        setupUserStatusModal(activationButton, userId);
    });
}

function setupDeleteRoleButtonBehaviour() {

    deleteRoleButton.on('click', function(event) {
        var roleId = $(event.currentTarget.closest('tr')).attr('data-id');
        setupDeleteRoleModal(deleteRoleButton, roleId);
    });
}

function setupRoleTableBehaviour() {

    // delegate table click events on the corresponding row
    roleTable.on('click', 'tbody tr .role-row', function(event) {

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

function toggleUserStatus(target, userId) {

    var apiSettings = getUserApiSettings(userId, function(user) {
        var data = {
            username: user.username,
            active: !user.active
        };
        return updateUser(target, data, userId);
    });

    return function() {
        return target.api(apiSettings);
    };
}

function updateUser(target, data, userId) {

    return target.api({
        action: 'user actions',
        method: 'put',
        on: 'now',
        beforeXHR: commons.utils.setCsrfTokenHeader,
        urlData: {
            id: userId
        },
        data: data,
        onSuccess: commons.utils.redirectTo(window.location.href)
    });
}

function deleteUser(target, userId) {

    var apiSettings = {
        action: 'user actions',
        method: 'delete',
        on: 'now',
        beforeXHR: commons.utils.setCsrfTokenHeader,
        urlData: {
            id: userId
        },
        onSuccess: commons.utils.redirectTo(window.location.href)
    };

    return function() {
        target.api(apiSettings);
    };
}

function deleteRole(target, roleId) {

    var apiSettings = {
        action: 'role actions',
        method: 'delete',
        on: 'now',
        beforeXHR: commons.utils.setCsrfTokenHeader,
        urlData: {
            id: roleId
        },
        onSuccess: commons.utils.redirectTo(window.location.href)
    };

    return function() {
        target.api(apiSettings);
    };
}

function getUserApiSettings(userId, action) {
    return {
        action: 'user actions',
        on: 'now',
        method: 'get',
        beforeXHR: commons.utils.setCsrfTokenHeader,
        urlData: {
            id: userId
        },
        onSuccess: action
    };
}
