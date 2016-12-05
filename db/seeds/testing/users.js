exports.seed = function(knex, Promise) {

    return knex('user')
        .del()
        .then(function() {

            return Promise.all([

                knex('user').insert({
                    id: 1,
                    username: 'admin',
                    email: 'admin@gmail.com',
                    password: '$2a$10$VAVGq0cwRzsHWRLq9wexk.vE9AJlvE0IOoXt7Ru/J/hQVxgJz7ZG.' // admin
                }),
                knex('user').insert({
                    id: 2,
                    username: 'test',
                    email: 'test@gmail.com',
                    password: '$2a$10$t7TOeE4Xqwadu3rCzcqsPuFO60UkG0ertEHwEgaXkEY8tMQnJBgHe' // test
                }),
                knex('user').insert({
                    id: 3,
                    username: 'guest',
                    email: 'guest@gmail.com',
                    password: '$2a$10$69gf1wrnvXhS6OArva47lut/I5ovAn7pdXSJfRNHHFZ0/9t/f8sXW' // guest
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
