exports.seed = function(knex, Promise) {

    return Promise.all([

        knex('user').del().then(function() {

            return Promise.all([

                knex('user').insert({
                    id: 1,
                    active: true,
                    name: 'Admin User',
                    username: 'admin',
                    email: 'admin@gmail.com',
                    password: '$2a$10$VAVGq0cwRzsHWRLq9wexk.vE9AJlvE0IOoXt7Ru/J/hQVxgJz7ZG.' // admin
                }),
                knex('user').insert({
                    id: 2,
                    active: true,
                    name: 'Test User',
                    username: 'test',
                    email: 'test@gmail.com',
                    password: '$2a$10$t7TOeE4Xqwadu3rCzcqsPuFO60UkG0ertEHwEgaXkEY8tMQnJBgHe' // test
                }),
                knex('user').insert({
                    id: 3,
                    active: false,
                    name: 'Guest User',
                    username: 'guest',
                    email: 'guest@gmail.com',
                    password: '$2a$10$69gf1wrnvXhS6OArva47lut/I5ovAn7pdXSJfRNHHFZ0/9t/f8sXW' // guest
                }),
                knex('user').insert({
                    id: 4,
                    active: true,
                    name: 'User with no Roles',
                    username: 'noroles',
                    email: 'noroles@gmail.com',
                    password: '$2a$10$69gf1wrnvXhS6OArva47lut/I5ovAn7pdXSJfRNHHFZ0/9t/f8sXW' // guest
                })
            ]);
        }),

        knex('role').del().then(function() {

            return Promise.all([

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
            ]);
        }),

        knex('user_role').del().then(function() {

            return Promise.all([

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
        })
    ]);
};
