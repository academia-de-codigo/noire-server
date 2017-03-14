exports.seed = function(knex, Promise) {

    return Promise.all([

        knex('permission').del().then(function() {

            return Promise.all([
                knex('permission').insert({
                    id: 1,
                    action: 'create',
                    resource_id: 1
                }),
                knex('permission').insert({
                    id: 2,
                    action: 'read',
                    resource_id: 1
                }),
                knex('permission').insert({
                    id: 3,
                    action: 'update',
                    resource_id: 1
                }),
                knex('permission').insert({
                    id: 4,
                    action: 'delete',
                    resource_id: 1
                }),
                knex('permission').insert({
                    id: 5,
                    action: 'create',
                    resource_id: 2
                }),
                knex('permission').insert({
                    id: 6,
                    action: 'read',
                    resource_id: 2
                }),
                knex('permission').insert({
                    id: 7,
                    action: 'update',
                    resource_id: 2
                }),
                knex('permission').insert({
                    id: 8,
                    action: 'delete',
                    resource_id: 2
                }),
                knex('permission').insert({
                    id: 9,
                    action: 'read',
                    resource_id: 4
                })
            ]);
        }),
        knex('resource').del().then(function() {

            return Promise.all([

                knex('resource').insert({
                    id: 1,
                    name: 'user'
                }),
                knex('resource').insert({
                    id: 2,
                    name: 'role'
                }),
                knex('resource').insert({
                    id: 3,
                    name: 'test'
                }),
                knex('resource').insert({
                    id: 4,
                    name: 'noroles'
                })
            ]);
        }),
        knex('role_permission').del().then(function() {

            return Promise.all([

                knex('role_permission').insert({
                    role_id: 1,
                    permission_id: 1
                }),
                knex('role_permission').insert({
                    role_id: 1,
                    permission_id: 2
                }),
                knex('role_permission').insert({
                    role_id: 1,
                    permission_id: 3
                }),
                knex('role_permission').insert({
                    role_id: 1,
                    permission_id: 4
                }),
                knex('role_permission').insert({
                    role_id: 1,
                    permission_id: 5
                }),
                knex('role_permission').insert({
                    role_id: 1,
                    permission_id: 6
                }),
                knex('role_permission').insert({
                    role_id: 1,
                    permission_id: 7
                }),
                knex('role_permission').insert({
                    role_id: 1,
                    permission_id: 8
                }),
                knex('role_permission').insert({
                    role_id: 2,
                    permission_id: 2
                }),
                knex('role_permission').insert({
                    role_id: 2,
                    permission_id: 3
                }),
                knex('role_permission').insert({
                    role_id: 2,
                    permission_id: 6
                })
            ]);
        })
    ]);
};
