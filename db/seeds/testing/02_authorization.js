exports.seed = function(knex) {
    return knex('resources')
        .del()
        .then(function() {
            return Promise.all([
                knex('resources').insert({
                    id: 1,
                    name: 'user',
                    description: 'A user'
                }),
                knex('resources').insert({
                    id: 2,
                    name: 'role'
                }),
                knex('resources').insert({
                    id: 3,
                    name: 'test',
                    description: 'test description'
                }),
                knex('resources').insert({
                    id: 4,
                    name: 'noroles'
                }),
                knex('resources').insert({
                    id: 5,
                    name: 'contact',
                    description: 'contact description'
                }),
                knex('resources').insert({
                    id: 6,
                    name: 'permission',
                    description: 'permission description'
                }),
                knex('resources').insert({
                    id: 7,
                    name: 'no test',
                    description: 'description'
                })
            ]);
        })
        .then(function() {
            return knex('permissions')
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
                            resource_id: 4,
                            description: 'Should not change'
                        }),
                        knex('permissions').insert({
                            id: 10,
                            action: 'delete',
                            resource_id: 5,
                            description: 'Should not change'
                        })
                    ]);
                });
        })
        .then(function() {
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
                        }),
                        knex('roles_permissions').insert({
                            role_id: 4,
                            permission_id: 6
                        })
                    ]);
                });
        });
};
