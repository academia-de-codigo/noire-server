/**
 * View partials helper
 * @module
 */

/**
 * Gets the view partial
 * @param {string} param the partial name
 * @returns {string} the view partial
 */
exports.getPartialHelper = function(param) {

    const partials = {
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
