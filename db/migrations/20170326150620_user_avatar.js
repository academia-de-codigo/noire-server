exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.table('user', function(table) {
            table.string('avatar');
        })
    ]);
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.table('user', function(table) {
            table.dropColumn('avatar');
        })
    ]);
};
