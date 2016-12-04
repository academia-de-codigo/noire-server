exports.seed = function(knex, Promise) {

    return knex('user')
        .del()
        .then(function() {

            return Promise.all([

                knex('user').insert({
                    id: 1,
                    username: 'admin',
                    email: 'admin@gmail.com',
                    password: 'admin'
                }),
                knex('user').insert({
                    id: 2,
                    username: 'test',
                    email: 'test@gmail.com',
                    password: 'test'
                }),
                knex('user').insert({
                    id: 3,
                    username: 'guest',
                    email: 'guest@gmail.com',
                    password: 'guest'
                }),

                knex('role').insert({
                    id: 1,
                    name: 'admin'
                }),
                knex('role').insert({
                    id: 2,
                    name: 'user'
                }),
                knex('role').insert({
                    id: 3,
                    name: 'guest'
                }),

                knex('role').insert({
                    id: 4,
                    name: 'guest2'
                }),

                knex('user_role').insert({
                    user_id: 1,
                    role_id: 1
                }),
                knex('user_role').insert({
                    user_id: 1,
                    role_id: 2
                }),
                knex('user_role').insert({
                    user_id: 1,
                    role_id: 3
                }),
                knex('user_role').insert({
                    user_id: 2,
                    role_id: 2
                }),
                knex('user_role').insert({
                    user_id: 2,
                    role_id: 3
                }),
                knex('user_role').insert({
                    user_id: 3,
                    role_id: 3
                })
        ]);

    });
};
