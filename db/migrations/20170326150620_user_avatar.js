const User = require('models/authorization/user');

exports.up = function(knex) {
    return Promise.all([
        knex.schema.table('user', function(table) {
            table.string('avatar', User.AVATAR_MAX_LENGTH);
        })
    ]);
};

exports.down = function(knex) {
    return Promise.all([
        knex.schema.table('user', function(table) {
            table.dropColumn('avatar');
        })
    ]);
};
