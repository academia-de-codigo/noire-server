exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.renameTable('user', 'users'),
        knex.schema.renameTable('role', 'roles'),
        knex.schema.renameTable('user_role', 'users_roles'),
        knex.schema.renameTable('resource', 'resources'),
        knex.schema.renameTable('permission', 'permissions'),
        knex.schema.renameTable('role_permission', 'roles_permissions')
    ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.renameTable('users', 'user'),
        knex.schema.renameTable('roles', 'role'),
        knex.schema.renameTable('users_roles', 'user_role'),
        knex.schema.renameTable('resources', 'resource'),
        knex.schema.renameTable('permissions', 'permission'),
        knex.schema.renameTable('roles_permissions', 'role_permission')
    ]);
};
