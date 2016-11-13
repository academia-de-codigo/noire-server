module.exports = {
    verbose: true,
    debug: true,
    coverage: true,
    threshold: 85,
    lint: true,
    assert: 'code',
    'coverage-path': 'lib',
    'coverage-exclude': 'config',
    paths: ['test/manager.js',
        'test/controllers',
        'test/plugins'
    ],
    globals: '__core-js_shared__' // https://github.com/tgriesser/knex/issues/1720
};
