exports.seed = function(knex, Promise) {
    return Promise.all([
        knex('resources').insert({
            id: 1,
            name: 'user',
            description: 'System Users'
        }),
        knex('resources').insert({
            id: 2,
            name: 'role',
            description: 'System Roles'
        }),
        knex('resources').insert({
            id: 3,
            name: 'contact',
            description: 'Contacts Management'
        }),
        knex('resources').insert({
            id: 4,
            name: 'permission',
            description: 'System Permissions'
        })
    ])
        .then(() => {
            return Promise.all([
                knex('permissions').insert({
                    id: 1,
                    action: 'create',
                    resource_id: 1,
                    description: 'Create a new user'
                }),
                knex('permissions').insert({
                    id: 2,
                    action: 'read',
                    resource_id: 1,
                    description: 'Fetch a user'
                }),
                knex('permissions').insert({
                    id: 3,
                    action: 'update',
                    resource_id: 1,
                    description: 'Update an existing user'
                }),
                knex('permissions').insert({
                    id: 4,
                    action: 'delete',
                    resource_id: 1,
                    description: 'Delete a user'
                }),
                knex('permissions').insert({
                    id: 5,
                    action: 'list',
                    resource_id: 1,
                    description: 'List users'
                }),
                knex('permissions').insert({
                    id: 6,
                    action: 'create',
                    resource_id: 2,
                    description: 'Create a new role'
                }),
                knex('permissions').insert({
                    id: 7,
                    action: 'read',
                    resource_id: 2,
                    description: 'Fetch a role'
                }),
                knex('permissions').insert({
                    id: 8,
                    action: 'update',
                    resource_id: 2,
                    description: 'Update an existing role, add users and permission'
                }),
                knex('permissions').insert({
                    id: 9,
                    action: 'delete',
                    resource_id: 2,
                    description: 'Delete a role, remove users and permission'
                }),
                knex('permissions').insert({
                    id: 10,
                    action: 'list',
                    resource_id: 2,
                    description: 'List roles'
                }),
                knex('permissions').insert({
                    id: 11,
                    action: 'read',
                    resource_id: 3,
                    description: 'Fetch a contact'
                }),
                knex('permissions').insert({
                    id: 12,
                    action: 'delete',
                    resource_id: 3,
                    description: 'Delete a contact'
                }),
                knex('permissions').insert({
                    id: 13,
                    action: 'list',
                    resource_id: 3,
                    description: 'List contacts'
                }),
                knex('permissions').insert({
                    id: 14,
                    action: 'read',
                    resource_id: 4,
                    description: 'Fetch a permission'
                }),
                knex('permissions').insert({
                    id: 15,
                    action: 'list',
                    resource_id: 4,
                    description: 'Lists permission'
                }),
                knex('permissions').insert({
                    id: 16,
                    action: 'update',
                    resource_id: 4,
                    description: 'Update an existing permission'
                }),
                knex('permissions').insert({
                    id: 17,
                    action: 'create',
                    resource_id: 4,
                    description: 'Create a new permission'
                }),
                knex('permissions').insert({
                    id: 18,
                    action: 'delete',
                    resource_id: 4,
                    description: 'Delete a permission'
                })
            ]);
        })
        .then(() => {
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
                    role_id: 1,
                    permission_id: 9
                }),
                knex('roles_permissions').insert({
                    role_id: 1,
                    permission_id: 10
                }),
                knex('roles_permissions').insert({
                    role_id: 1,
                    permission_id: 13
                }),
                knex('roles_permissions').insert({
                    role_id: 1,
                    permission_id: 14
                }),
                knex('roles_permissions').insert({
                    role_id: 1,
                    permission_id: 15
                }),
                knex('roles_permissions').insert({
                    role_id: 1,
                    permission_id: 16
                }),
                knex('roles_permissions').insert({
                    role_id: 1,
                    permission_id: 17
                }),
                knex('roles_permissions').insert({
                    role_id: 1,
                    permission_id: 18
                }),
                knex('roles_permissions').insert({
                    role_id: 2,
                    permission_id: 2
                }),
                knex('roles_permissions').insert({
                    role_id: 2,
                    permission_id: 7
                })
            ]);
        });
};
