module.exports = {
    verbose: true,
    debug: true,
    coverage: true,
    threshold: 90,
    lint: true,
    assert: 'code',
    'coverage-path': 'lib',
    'coverage-exclude': ['config.js', 'config-views.js'],
    paths: ['test/errors', 'test/utils', 'test/models', 'test/plugins', 'test/modules'],
    // TODO: track/fix global leaks
    // __core-js_shared__ -> https://github.com/tgriesser/knex/issues/1720
    globals: 'core,regeneratorRuntime,_babelPolyfill,__core-js_shared__'
};
