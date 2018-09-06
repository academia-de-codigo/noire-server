const Joi = require('joi');

const internals = {};

internals.environments = ['development', 'staging', 'production'];
internals.connections = ['web', 'api', 'webTls'];
internals.build = ['src', 'dist', 'views', 'pages', 'scripts', 'assets', 'images', 'fonts', 'styles'];
internals.prefixes = ['api', 'login', 'logout', 'renew', 'signup', 'register', 'passwordReset', 'passwordUpdate', 'admin', 'home', 'profile', 'scripts', 'images', 'styles', 'fonts'];

internals.getFileExtensionRegex = function(...filetypes) {
    const regex = new RegExp(`\.([0-9a-z]+)(?=[?#])|(\.)(?:[ ${filetypes.join()} ]+)$`);
    const error = `file must be of type ${filetypes.join()}`;
    return [regex, error];
};

internals.connectionSchema = Joi.object().keys({
        host: Joi.string().hostname(),
        port: Joi.number().port(),
        enabled: Joi.boolean(),
        tls: Joi.boolean(),
        cors: Joi.array()
    }).requiredKeys('host', 'port', 'enabled');

internals.connectionsSchema = function(connections) {
    const result = {};
    return connections.forEach(key => result[key] = internals.connectionSchema);
};

internals.usersSchema = {
    avatar: Joi.string().regex(...internals.getFileExtensionRegex('jpeg', 'jpg', 'png'))
};

internals.tlsSchema = {
        key: Joi.string().regex(...internals.getFileExtensionRegex('pem')),
        cert: Joi.string().regex(...internals.getFileExtensionRegex('pem'))
};

internals.prefixesSchema = function(prefixes) {
    const result = {};
    return prefixes.forEach(key => result[key] = Joi.string().uri({relativeOnly: true}));
};

internals.redirectSchema = Joi.object().keys({
    tlsOnly: Joi.array().items(Joi.object(internals.prefixesSchema(internals.prefixes)).required())
}).requiredKeys('tlsOnly');

internals.paginationSchema = {
    include: Joi.array().items(Joi.string().uri({relativeOnly: true})),
    exclude: Joi.array().items(Joi.string().uri({relativeOnly: true}))
};

internals.smtpSchema = Joi.object().keys({
    host: Joi.string().hostname(),
    port: Joi.number().port(),
    test: Joi.boolean()
}).requiredKeys('host', 'port', 'test');

internals.mailSchema = {
    templates: Joi.string().uri({relativeOnly: true}),
    compile: Joi.string().regex(...internals.getFileExtensionRegex('hbs')),
    address: Joi.object().keys({
        signup: Joi.string(),
        passwordReset: Joi.string()
    }),
    url: Joi.object().keys({
        signup: Joi.string().uri(),
        passwordReset: Joi.string().uri()
    }),
    maximumSignupRequests: Joi.number().positive()
};

internals.schema = {
    debug: Joi.boolean().required(),
    environment: Joi.string().valid(internals.environments).required(),
    connections: Joi.object().keys(internals.connectionsSchema(internals.connections)),
    auth: Joi.object().required(),
    build: Joi.object().required(),
    prefixes: Joi.object().keys(internals.prefixesSchema(internals.prefixes)),
    cache: Joi.object().required(),
    users: Joi.object().keys(internals.usersSchema),
    tls: Joi.object().keys(internals.tlsSchema),
    redirect: Joi.object().required(),
    pagination: Joi.object().keys(internals.paginationSchema),
    smtp: internals.smtpSchema,
    mail: Joi.object().keys(internals.mailSchema)
};

module.exports = Joi.object().keys(internals.schema);
