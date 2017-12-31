exports.seed = function(knex, Promise) {

    return knex('role_permission').del().then(() => {

        return knex('permission').del();

    }).then(() => {

        return knex('resource').del();

    }).then(() => {

        return knex('user_role').del();

    }).then(() => {

        return Promise.all([
            knex('user').del(),
            knex('role').del(),
        ]);
    });
}

