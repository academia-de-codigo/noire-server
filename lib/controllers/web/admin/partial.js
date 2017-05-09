exports.getPartialHelper = function(param) {

    var partials = {
        main: 'admin/main',
        user: 'admin/user',
        users: 'admin/user-list',
        role: 'admin/role',
        roles: 'admin/role-list',
        resources: 'admin/resource-list'
    };

    return function() {
        return partials[param] || partials.main;
    };
};
