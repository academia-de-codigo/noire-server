const ConfigSchema = require('config/schema');
const Logger = require('plugins/logger').getLogger();
const NSError = require('errors/nserror');

exports.validate = function(config) {
    const { warning, error } = ConfigSchema.validate(config, { debug: true });

    if (warning) {
        Logger.warning(warning);
    }

    if (error) {
        Logger.error(error);
        throw NSError.CONFIG_ERROR();
    }
};
