const Fs = require('fs');
const Config = require('config');

module.exports = (function() {
    return Config.models.modules.reduce(
        (acc, module) =>
            acc.concat(
                ...Fs.readdirSync(`${Config.models.path}/${module}`)
                    .filter(model => model.endsWith('.js'))
                    .map(model => `${module}/${model}`)
            ),
        []
    );
})();
