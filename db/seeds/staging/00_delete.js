exports.seed = function(knex, Promise) {
    return knex('roles_permissions')
        .del()
        .then(() => {
            return knex('permissions').del();
        })
        .then(() => {
            return knex('resources').del();
        })
        .then(() => {
            return knex('users_roles').del();
        })
        .then(() => {
            return Promise.all([knex('users').del(), knex('roles').del()]);
        });
};
