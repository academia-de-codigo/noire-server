const Joi = require('joi');
const ConfigSchema = require('config/schema');
const Logger = require('plugins/logger').getLogger();
const NSError = require('errors/nserror');

exports.validate = function(config) {
    const { error } = Joi.validate(config, ConfigSchema);

    if (error) {
        Logger.error(error);
        throw NSError.CONFIG_ERROR();
    }
};
