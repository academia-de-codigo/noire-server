module.exports = {
    verbose: true,
    debug: true,
    coverage: true,
    threshold: 90,
    lint: true,
    assert: 'code',
    'coverage-path': 'lib',
    'coverage-exclude': 'config',
    //paths: ['test'],
    paths: ['test/plugins/routes.js'],
    globals: '__core-js_shared__' // https://github.com/tgriesser/knex/issues/1720
};
