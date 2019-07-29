const Manager = require('utils/manager');
const Config = require('config');
const Models = require('models');
const Logger = require('plugins/logger');

const internals = {
    // plugins to register for each connection using the glue compose api
    plugins: [
        'logger',
        'db',
        { plugin: 'repository', options: { models: Models } },
        'auth',
        { plugin: 'api', routes: { prefix: Config.prefixes.api } },
        'docs',
        'pagination',
        'mailer'
    ]
};

const start = async function() {
    try {
        // start servers
        internals.server = await Manager.start(internals.plugins);
    } catch (err) {
        Logger.getLogger().error(err);
        process.exit(1);
    }
};

start();
