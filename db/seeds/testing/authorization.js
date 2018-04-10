exports.seed = function(knex, Promise) {
    return Promise.all([
        knex('permissions')
            .del()
            .then(function() {
                return Promise.all([
                    knex('permissions').insert({
                        id: 1,
                        action: 'create',
                        resource_id: 1
                    }),
                    knex('permissions').insert({
                        id: 2,
                        action: 'read',
                        resource_id: 1
                    }),
                    knex('permissions').insert({
                        id: 3,
                        action: 'update',
                        resource_id: 1
                    }),
                    knex('permissions').insert({
                        id: 4,
                        action: 'delete',
                        resource_id: 1
                    }),
                    knex('permissions').insert({
                        id: 5,
                        action: 'create',
                        resource_id: 2
                    }),
                    knex('permissions').insert({
                        id: 6,
                        action: 'read',
                        resource_id: 2
                    }),
                    knex('permissions').insert({
                        id: 7,
                        action: 'update',
                        resource_id: 2
                    }),
                    knex('permissions').insert({
                        id: 8,
                        action: 'delete',
                        resource_id: 2
                    }),
                    knex('permissions').insert({
                        id: 9,
                        action: 'read',
                        resource_id: 4
                    })
                ]);
            }),
        knex('resources')
            .del()
            .then(function() {
                return Promise.all([
                    knex('resources').insert({
                        id: 1,
                        name: 'user'
                    }),
                    knex('resources').insert({
                        id: 2,
                        name: 'role'
                    }),
                    knex('resources').insert({
                        id: 3,
                        name: 'test'
                    }),
                    knex('resources').insert({
                        id: 4,
                        name: 'noroles'
                    })
                ]);
            }),
        knex('roles_permissions')
            .del()
            .then(function() {
                return Promise.all([
                    knex('roles_permissions').insert({
                        role_id: 1,
                        permission_id: 1
                    }),
                    knex('roles_permissions').insert({
                        role_id: 1,
                        permission_id: 2
                    }),
                    knex('roles_permissions').insert({
                        role_id: 1,
                        permission_id: 3
                    }),
                    knex('roles_permissions').insert({
                        role_id: 1,
                        permission_id: 4
                    }),
                    knex('roles_permissions').insert({
                        role_id: 1,
                        permission_id: 5
                    }),
                    knex('roles_permissions').insert({
                        role_id: 1,
                        permission_id: 6
                    }),
                    knex('roles_permissions').insert({
                        role_id: 1,
                        permission_id: 7
                    }),
                    knex('roles_permissions').insert({
                        role_id: 1,
                        permission_id: 8
                    }),
                    knex('roles_permissions').insert({
                        role_id: 2,
                        permission_id: 2
                    }),
                    knex('roles_permissions').insert({
                        role_id: 2,
                        permission_id: 3
                    }),
                    knex('roles_permissions').insert({
                        role_id: 2,
                        permission_id: 6
                    })
                ]);
            })
    ]);
};
